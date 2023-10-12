import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Content } from 'src/schemas/content.schema';
import mongoose, { Types } from 'mongoose';
import { AddContentEntryDto, CheckAnswerDto, RecordActivityDto, UpdateContentDto } from './dto';
import { Activity } from 'src/schemas/activity.schema';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class QuickLearningService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Content.name)
    private contentModel: mongoose.Model<Content>,
    @InjectModel(Activity.name)
    private activityModel: mongoose.Model<Activity>,
    private tagsService:TagsService
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
}
