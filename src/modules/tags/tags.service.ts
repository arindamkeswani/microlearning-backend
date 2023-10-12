import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from 'src/schemas/tags.schema';
import { createTagsDto, deleteTagsDto, getTagsDto } from './dto';
import * as mongoose from "mongoose";
import { Types } from "mongoose";
import { isArray } from 'class-validator';
import { createTagsMapDto } from './dto/create-tags-map.dto';
const ObjectId = Types.ObjectId;

@Injectable()
export class TagsService {
    constructor (
        @InjectModel(Tag.name)
        private tagsModel: mongoose.Model<Tag>,
    ) { }

    async createTags(body: createTagsDto) {
        let tags: Array<string> | string = body.name;
        
        
        if(isArray(tags)) {
            let bulkObj = [];
            
            for(let i in tags) {
                let tagName = tags[i];
                bulkObj.push({name : tagName});
            }   

            return await this.tagsModel.insertMany(bulkObj);
        }   
        
        let obj = {
            name: body.name
        };

        return await this.tagsModel.create(obj);
    
    }


    async createTagsMap(body: createTagsMapDto) {
        let { id, content } = body;
        let contentId = new ObjectId(content);
        let tagsAr: Array<any> = [];
        
        if(!isArray(id)) {  
            tagsAr.push(id);
        }
        else {
            tagsAr = id;
        }
      
        let tagIds = tagsAr.map((el)=>new ObjectId(el));
        let updatedResponses = [];

        for(let i in tagIds) {
            let updatedRes = await this.tagsModel.findOneAndUpdate({ _id: tagIds[i]}, {$push: {content: contentId}});
            updatedResponses.push(updatedRes);
        }

        return updatedResponses;
    }


    async deleteTags(body: deleteTagsDto) {
        let { id } = body;
        let tagsAr: Array<any> = [];
        
        if(!isArray(id)) {  
            tagsAr.push(id);
        }
        else {
            tagsAr = id;
        }
        
        tagsAr = tagsAr.map(el=>new ObjectId(el));

        return await this.tagsModel.deleteMany({ _id: {
            $in: tagsAr
        }});
    }

    
    async getTags(query: getTagsDto) {
        let { q }= query;
        
        let startsWithRegexp = new RegExp(`^${q ? q : ""}`, 'i');

        let nameFilterRegex = { $regexMatch: { input: "$name", regex: startsWithRegexp } }
        
        let tags = await this.tagsModel.aggregate([
            {
                $match: {
                    $expr: {
                        $or: [
                            nameFilterRegex
                        ],
                    }
                },
            }
        ]);

        return tags;
    }

    async getTagsByIds(tagIds) {
        let tags = await this.tagsModel.find(
            {
                _id: { "$in": tagIds }
            }
        )
        return tags;
    }
}

