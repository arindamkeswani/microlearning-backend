import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { item } from "src/schemas/items.schema";
import { CreateItemDto } from "./dto/itmes.dto";
import { ItemTypes } from "src/common/utils/enums";
import { CommonFunctions } from "src/common/utils/common-functions";
@Injectable()
export class ItemService {
    constructor(
        @InjectModel(item.name)
        private itemModel: mongoose.Model<item>,
        private commonFunctions: CommonFunctions,
    ) { }
    async getItemList(query) {
        const itemParams:any={
            searchParams:{
                
            },
            sort:{createdAt:1}
        }
        const limit=query.limit || 20
        const page=query.page ? query.page-1:0
        if(query.type && query.type==ItemTypes.BATCH){
            itemParams.searchParams.type=ItemTypes.BATCH
        }else if(query.type && query.type==ItemTypes.STORE){
            itemParams.searchParams.type=ItemTypes.STORE
        }

        return await this.itemModel.find(itemParams.searchParams).sort(itemParams.sort).skip(page*limit).limit(limit).populate({path:"tags",select:"name"}).lean()
    }

    async addItem(body:CreateItemDto){
        const data={
            ...body,
            rating:await this.commonFunctions.getRandomRating()
        }
        return await this.itemModel.create(data)
    }

    async updateItem(body,params){

        const updateParams={
            _id:params.id
        }
        await this.itemModel.updateOne(updateParams,body)
        return
    }

    async deleteItem(param){
        const itemParams={
            _id:param.id
        }
        return await this.itemModel.deleteOne(itemParams)
        
    }
}