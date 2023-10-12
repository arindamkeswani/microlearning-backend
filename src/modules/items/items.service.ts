import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { item } from "src/schemas/items.schema";
import { CreateItemDto } from "./dto/itmes.dto";
import { ItemTypes } from "src/common/utils/enums";
@Injectable()
export class ItemService {
    constructor(
        @InjectModel(item.name)
        private itemModel: mongoose.Model<item>,
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

        return await this.itemModel.find(itemParams.searchParams).sort(itemParams.sort).skip(page*limit).limit(limit).lean()
    }

    async addItem(body:CreateItemDto){
        return await this.itemModel.create(body)
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