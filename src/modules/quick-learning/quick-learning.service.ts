import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Content } from 'src/schemas/content.schema';
import mongoose, { Types } from 'mongoose';
import { AddContentEntryDto, CheckAnswerDto, RecordActivityDto, UpdateContentDto } from './dto';
import { Activity } from 'src/schemas/activity.schema';
import { TagsService } from '../tags/tags.service';
import { User } from 'src/schemas/users.schema';
import { MAX_TAG_LIMIT } from 'src/common/utils/constants';


@Injectable()
export class QuickLearningService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Content.name)
    private contentModel: mongoose.Model<Content>,
    @InjectModel(Activity.name)
    private activityModel: mongoose.Model<Activity>,
    private tagsService:TagsService,
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
    return await this.activityModel.create(activity);

  }

  async checkAnswer(body: CheckAnswerDto) {
    const { contentId, user, language, selectedOptionIdx } = body;
    //if the activity document has not been created yet AND if student has previously submitted this question
    const attentionDocs = await this.activityModel.find({
        contentId: contentId,
        user: user, 
    }).lean()
    .sort({createdAt: -1});

    // console.log(attentionDocs);
    if(attentionDocs.length == 0){
        throw new BadRequestException("Record activity before checking answer")
    }

    for(let i=0; i<attentionDocs.length; i++){
        let currDoc = attentionDocs[i];
        if(currDoc.isAnsCorrect!=null){ //student has submitted previously, this is not allowed
            throw new BadRequestException("You have already submitted this question")
        }
    }
   
    //Check if answer submitted by the student is correct
    const ansInfo = await this.contentModel.findOne({_id: contentId}, 'correctOptionIdx');
    const currLanguageAnsIdx = ansInfo.correctOptionIdx[language];

    const isAnsCorrect = selectedOptionIdx == currLanguageAnsIdx;
    
    //add submission info to activity table
    let updationResponse = await this.activityModel.updateOne(
      {_id: attentionDocs[0]},
      {isAnsCorrect}
    )

    //return correctness and correct answer index
    return {
      isAnsCorrect: isAnsCorrect,
      correctIdx: currLanguageAnsIdx,
      metadata: updationResponse
    }
  }

  async updateContent(body: UpdateContentDto){
    const contentId = body.id;
    const filter = { _id: contentId }
    delete body.id;

    let tagsResponse = await this.tagsService.createTagsMap({id: body.tags, content: contentId});

    return {
        contentUpdation: await this.contentModel.updateOne(filter, body),
        tagsUpdation: tagsResponse
    }
  }


  async getQlFeed(userId, page, limit){
    let isFeedFull = false
    let videosToBeExcluded = []
    let validContentIds = []
    //Get user's interests (tags)
    const interests = await this.getStudentInterests(userId, 0, MAX_TAG_LIMIT);
    const interestTags = interests.map( row => { return row.tag } );
    console.log(interests, interestTags);

    //Get user's watchedContent
    const watchedContentIds = await this.getWatchedContentIds(userId);
    videosToBeExcluded = [...videosToBeExcluded, ...watchedContentIds];

    //P1
    // Get content based on interest (while filtering out viewed content)
    const freshContentHighInterest = await this.getFreshContentForFeed(interestTags, videosToBeExcluded)
    console.log(`${freshContentHighInterest.length} high interest video(s) found: `, freshContentHighInterest);
    //check if info is sufficient, get content details, if yes, randomize
    if(freshContentHighInterest.length >= limit) {
      isFeedFull = true;
      validContentIds = [...freshContentHighInterest]
    }
    //if insufficient, get all remaining tags and repeat process
    // if(isFeedFull == false && )
    //if still insufficient, get random un-watched content and return



  }

  private async getStudentInterests(userId, min, max){
    const userInfo: any = await this.userModel.findOne(
      {_id: userId},  "contact topics"
    )
    //user preferences have not been calculated yet
    if(userInfo == null || userInfo.topics == null){
      return [];
    }

    //Get Top tags
    const interests = userInfo?.topics?.interests ? userInfo.topics.interests.slice(min, max) : []
    return interests;
  }

  private async getWatchedContentIds(userId){
    let activiyList = await this.activityModel.find(
      {user: userId}, "contentId"
    ).limit(500);

    let contentIdList = activiyList.map( row => {
      return row.contentId.toString();
    } )

    return contentIdList;
  }

  private async getFreshContentForFeed(interests, watchedContentIds){
    let cumulativeContentIds = []
    let watchedOverlap = []

    //get content based on tags
    let tagWiseContent = await this.tagsService.getTagsByIds(interests)

    //filter out watched content
    for(let i=0; i < tagWiseContent.length; i++){
      let currTagInfo = tagWiseContent[i];
      let currTagContent = currTagInfo.content || [];
      for(let j=0; j < currTagContent.length; j++){
        let currContentId = currTagContent[j];
        if(watchedContentIds.includes(currContentId) == false){ //unwatched content
          cumulativeContentIds.push(currContentId);
        } else{
          watchedOverlap.push(currContentId)
        }
      }
    }
    
    console.log(`User has watched videos: ${watchedOverlap.join(', ')}`);
    return cumulativeContentIds;
    
  }
}
