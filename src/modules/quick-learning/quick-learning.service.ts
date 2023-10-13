import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Content } from 'src/schemas/content.schema';
import mongoose, { Types } from 'mongoose';
import {
  AddContentEntryDto,
  CheckAnswerDto,
  RecordActivityDto,
  UpdateContentDto,
  DeleteTagsDto,
} from './dto';
import { Activity } from 'src/schemas/activity.schema';
import { TagsService } from '../tags/tags.service';
import { User } from 'src/schemas/users.schema';
import { INTEREST_LEVEL, MAX_TAG_LIMIT } from 'src/common/utils/constants';
import { isArray } from 'class-validator';
const ObjectId = Types.ObjectId;

@Injectable()
export class QuickLearningService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Content.name)
    private contentModel: mongoose.Model<Content>,
    @InjectModel(Activity.name)
    private activityModel: mongoose.Model<Activity>,
    private tagsService: TagsService,
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async addNewContentEntry(contentInfo: AddContentEntryDto) {
    return (await this.contentModel.insertMany([contentInfo]))[0];
  }

  async updateContentInfo(id: string, info: object) {
    const filter = { _id: id };
    return await this.contentModel.updateOne(filter, info);
  }

  async recordStudentActivity(activity: RecordActivityDto) {
    //record attention
    if (activity.attention < 20) {
      return {
        message: 'Ignored this activity due to inufficient attention',
      };
    }
    let formattedActivity = {
      ...activity,
      user: new Types.ObjectId(activity.user)
    }
    return await this.activityModel.create(formattedActivity);
  }

  async checkAnswer(body: CheckAnswerDto) {
    const { contentId, user, language, selectedOptionIdx } = body;
    //if the activity document has not been created yet AND if student has previously submitted this question
    const attentionDocs = await this.activityModel
      .find({
        contentId: contentId,
        user: new Types.ObjectId(user),
      })
      .lean()
      .sort({ createdAt: -1 });

    // console.log(attentionDocs); 
    if (attentionDocs.length == 0) {
      throw new BadRequestException('Record activity before checking answer');
    }

    for (let i = 0; i < attentionDocs.length; i++) {
      const currDoc = attentionDocs[i];
      if (currDoc.isAnsCorrect != null) {
        //student has submitted previously, this is not allowed
        throw new BadRequestException(
          'You have already submitted this question',
        );
      }
    }

    //Check if answer submitted by the student is correct
    const ansInfo = await this.contentModel.findOne(
      { _id: contentId },
      'correctOptionIdx',
    );
    const currLanguageAnsIdx = ansInfo.correctOptionIdx[language];

    const isAnsCorrect = selectedOptionIdx == currLanguageAnsIdx;

    //add submission info to activity table
    const updationResponse = await this.activityModel.updateOne(
      { _id: attentionDocs[0] },
      { isAnsCorrect },
    );

    //return correctness and correct answer index
    return {
      isAnsCorrect: isAnsCorrect,
      correctIdx: currLanguageAnsIdx,
      metadata: updationResponse,
    };
  }

  async updateContent(body: UpdateContentDto) {
    const contentId = body.id;
    const filter = { _id: contentId };
    delete body.id;

    const tagsResponse = await this.tagsService.createTagsMap({
      id: body.tags,
      content: contentId,
    });

    return {
      contentUpdation: await this.contentModel.updateOne(filter, body),
      tagsUpdation: tagsResponse,
    };
  }

  async getQlFeed(userId, limit) {
    let isFeedFull = false;
    let contentIdsToBeExcluded = [];
    let validContentIds = [];
    const count = {
      highInterest: 0,
      lowInterest: 0,
      random: 0,
    };

    //Get user's watchedContent
    const watchedContentIds = await this.getWatchedContentIds(userId);
    contentIdsToBeExcluded = [...contentIdsToBeExcluded, ...watchedContentIds];

    //P1
    // Get content based on interest (while filtering out viewed content)
    console.log(`-----Fetching High-Interest Content`);
    const freshContentHighInterest =
      (await this.getContentByInterest(
        userId,
        0,
        MAX_TAG_LIMIT,
        contentIdsToBeExcluded,
      )) || [];

    count.highInterest = freshContentHighInterest.length;
    validContentIds = [...validContentIds, ...freshContentHighInterest];
    isFeedFull = validContentIds >= limit ? true : false;

    //P2
    //if insufficient, get all remaining tags and repeat process
    let freshContentLowInterest = [];
    if (isFeedFull == false) {
      console.log(
        `-----Insufficient high-interest content. Found: ${count.highInterest} | Required: ${limit} `,
      );
      console.log(`-----Fetching Low-Interest Content`);
      contentIdsToBeExcluded = [
        ...contentIdsToBeExcluded,
        ...freshContentHighInterest,
      ];
      freshContentLowInterest = await this.getContentByInterest(
        userId,
        MAX_TAG_LIMIT,
        1000,
        contentIdsToBeExcluded,
      );
      count.lowInterest = freshContentLowInterest.length;
      validContentIds = [...validContentIds, ...freshContentLowInterest];
    }
    isFeedFull = validContentIds >= limit ? true : false;

    //P3
    //if still insufficient, get random un-watched content and return
    let randomContent;
    if (isFeedFull == false) {
      console.log(
        `-----Insufficient low-interest content. Found: ${
          count.lowInterest
        } | Required: ${limit - count.highInterest} `,
      );
      console.log(`-----Fetching Random Content`);
      contentIdsToBeExcluded = [
        ...contentIdsToBeExcluded,
        ...freshContentLowInterest,
      ];

      const currFetchedContent = [
        ...freshContentHighInterest,
        ...freshContentLowInterest,
      ];
      randomContent = await this.getRandomContentForFeed(
        limit,
        currFetchedContent,
      );
      count.random = randomContent.length;
      validContentIds = [...validContentIds, ...randomContent];
    }
    console.log(
      `-----Random content breakdown - Found: ${count.random} | Required: ${
        limit - count.highInterest - count.lowInterest
      } `,
    );

    //fetch content info and return
    validContentIds = validContentIds.slice(0, limit);
    const contentInfo = await this.contentModel
      .find({ _id: { $in: validContentIds } })
      .populate({ path: 'tags', select: '_id name' })
      .populate({ path: 'uploadedBy', select: '_id username' })
      .lean();

    const contentInfoWithInterestLevel =
      await this.addInterestLevelToContentInfo(contentInfo, count);

    return {
      data: contentInfoWithInterestLevel,
      metadata: count,
    };
  }

  private async getContentByInterest(
    userId,
    minRank,
    maxRank,
    contentIdsToBeExcluded,
  ) {
    //Get user's interests (tags)
    const interests = await this.getStudentInterests(userId, minRank, maxRank);
    const interestTags = interests.map((row) => {
      return row.tag;
    });
    // console.log(interests, interestTags);

    const validContentIds = await this.getFreshContentForFeed(
      interestTags,
      contentIdsToBeExcluded,
    );
    console.log(
      `${validContentIds.length} high interest video(s) found: `,
      validContentIds,
    );

    return validContentIds ? validContentIds : [];
  }

  private async getStudentInterests(userId, min, max) {
    const userInfo: any = await this.userModel.findOne(
      { _id: userId },
      'contact topics',
    );
    //user preferences have not been calculated yet
    if (userInfo == null || userInfo.topics == null) {
      return [];
    }

    //Get Top tags
    const interests = userInfo?.topics?.interests
      ? userInfo.topics.interests.slice(min, max)
      : [];
    return interests;
  }

  private async getWatchedContentIds(userId) {
    const activiyList = await this.activityModel
      .find({ user: userId }, 'contentId')
      .limit(500);

    const contentIdList = activiyList.map((row) => {
      return row.contentId.toString();
    });

    return contentIdList;
  }

  private async getFreshContentForFeed(interests, watchedContentIds) {
    const cumulativeContentIds = [];
    const watchedOverlap = [];

    //get content based on tags
    const tagWiseContent = await this.tagsService.getTagsByIds(interests);

    //filter out watched content
    for (let i = 0; i < tagWiseContent.length; i++) {
      const currTagInfo = tagWiseContent[i];
      const currTagContent = currTagInfo.content || [];
      for (let j = 0; j < currTagContent.length; j++) {
        const currContentId = currTagContent[j];
        if (watchedContentIds.includes(currContentId) == false) {
          //unwatched content
          cumulativeContentIds.push(currContentId);
        } else {
          watchedOverlap.push(currContentId);
        }
      }
    }

    console.log(
      `--------- User has watched videos: ${watchedOverlap.join(', ')}`,
    );
    return cumulativeContentIds;
  }

  private async getRandomContentForFeed(limit, contentIdsToBeExcluded) {
    //get content which has been submitted, i.e. it should have a caption, and a default language
    let randomContent = await this.contentModel.aggregate([
      {
        $match: {
          language: { $ne: null },
          _id: {
            $nin: contentIdsToBeExcluded.map((contentId) => {
              return new Types.ObjectId(contentId);
            }),
          },
        },
      },
      { $sample: { size: limit } },
      { $project: { _id: 1, uploadedBy: 1 } },
    ]);

    randomContent = randomContent.map((row) => {
      return row._id.toString();
    });

    return randomContent;
  }

  private async addInterestLevelToContentInfo(contentInfo, count) {
    const newContentInfo = [];
    const countCopy = { ...count };
    for (let i = 0; i < contentInfo.length; i++) {
      const currContent = contentInfo[i];
      if (countCopy.highInterest > 0) {
        newContentInfo.push({
          ...currContent,
          interestLevel: INTEREST_LEVEL.HIGH,
        });
        // console.log('High: ', countCopy.highInterest);
        countCopy.highInterest = countCopy.highInterest - 1;
      } else if (countCopy.mediumInterest > 0) {
        newContentInfo.push({
          ...currContent,
          interestLevel: INTEREST_LEVEL.MEDIUM,
        });
        // console.log('Medium: ', countCopy.mediumInterest);
        countCopy.mediumInterest = countCopy.mediumInterest - 1;
      } else {
        newContentInfo.push({
          ...currContent,
          interestLevel: INTEREST_LEVEL.LOW,
        });
        // console.log('Low: ', countCopy.random);
        countCopy.random = countCopy.random - 1;
      }
    }

    return newContentInfo;
  }
  async deleteContent(body: DeleteTagsDto) {
    const { id } = body;
    let contentAr: Array<any> = [];

    if (!isArray(id)) {
      contentAr.push(id);
    } else {
      contentAr = id;
    }

    contentAr = contentAr.map((el) => new ObjectId(el));

    return await this.contentModel.deleteMany({
      _id: {
        $in: contentAr,
      },
    });
  }
}
