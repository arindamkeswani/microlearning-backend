import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { item } from "src/schemas/items.schema";
import { CreateItemDto } from "./dto/itmes.dto";
import { ItemTypes } from "src/common/utils/enums";
import { CommonFunctions } from "src/common/utils/common-functions";
import { UserService } from "../user/user.service";
import { ArrayService } from "src/common/utils/array-functions";
@Injectable()
export class ItemService {
    constructor(
        @InjectModel(item.name)
        private itemModel: mongoose.Model<item>,
        private commonFunctions: CommonFunctions,
        private userService: UserService,
        private arrayService: ArrayService
    ) { }
    async getItemList(query) {
        const itemParams: any = {
            searchParams: {

            },
            sort: { createdAt: 1 }
        }
        const limit = query.limit || 20
        const page = query.page ? query.page - 1 : 0
        if (query.type && query.type == ItemTypes.BATCH) {
            itemParams.searchParams.type = ItemTypes.BATCH
        } else if (query.type && query.type == ItemTypes.STORE) {
            itemParams.searchParams.type = ItemTypes.STORE
        }

        return await this.itemModel.find(itemParams.searchParams).sort(itemParams.sort).skip(page * limit).limit(limit).populate({ path: "tags", select: "name" }).lean()
    }

    async addItem(body: CreateItemDto) {
        const data = {
            ...body,
            rating: await this.commonFunctions.getRandomRating()
        }
        return await this.itemModel.create(data)
    }

    async updateItem(body, params) {

        const updateParams = {
            _id: params.id
        }
        await this.itemModel.updateOne(updateParams, body)
        return
    }

    async deleteItem(param) {
        const itemParams = {
            _id: param.id
        }
        return await this.itemModel.deleteOne(itemParams)

    }

    async getRecommendedItems(query) {
        const userId = query.userId
        const type = query.type
        const limit = query.limit || 20
        const page = query.page ? query.page - 1 : 0
        const user = await this.userService.getUserbyId(userId)
        const interestsTagsObjs = user[0]?.topics?.interests || []
        const strengthsTagsObjs = user[0]?.topics?.interests || []
        const weaknessesTagsObjs = user[0]?.topics?.interests || []
        const interestsTagesArr = interestsTagsObjs.map(tag => { return tag.tag })
        const strengthsTagesArr = strengthsTagsObjs.map(tag => { return tag.tag })
        const weaknessesTagesArr = weaknessesTagsObjs.map(tag => { return tag.tag })
        const interestsItemParams = {
            searchParams: {
                tags: { $in: interestsTagesArr },
                type: type
            },
            populate:{ path: "tags", select: "name" }
        }
        const strengthsItemParams = {
            searchParams: {
                tags: { $in: strengthsTagesArr },
                type: type
            },
            populate:{ path: "tags", select: "name" }
        }
        const weaknessesItemParams = {
            searchParams: {
                tags: { $in: weaknessesTagesArr },
                type: type
            },
            populate:{ path: "tags", select: "name" }
        }
        // const itemsList = await this.itemModel.find(interestsItemParams.searchParams).lean()
        const [interestsItemList, strengthsItemList, weaknessesItemList] = await Promise.all([
            this.itemModel.find(interestsItemParams.searchParams).populate(interestsItemParams.populate).lean(),
            this.itemModel.find(strengthsItemParams.searchParams).populate(strengthsItemParams.populate).lean(),
            this.itemModel.find(weaknessesItemParams.searchParams).populate(weaknessesItemParams.populate).lean()
        ])
        const interestsSortedArr = interestsItemList
            .map((mango) => ({
                ...mango,
                interest: "Interest",
                matchingIds: mango.tags.filter((id) => interestsTagesArr.includes(id.toString())).length,
            }))
            .sort((a, b) => b.matchingIds - a.matchingIds);
        const strengthsSortedArr = strengthsItemList
            .map((mango) => ({
                ...mango,
                interest: "Strength",
                matchingIds: mango.tags.filter((id) => strengthsTagesArr.includes(id.toString())).length,
            }))
            .sort((a, b) => b.matchingIds - a.matchingIds);
        const weaknessesSortedArr = weaknessesItemList
            .map((mango) => ({
                ...mango,
                interest: "Weakness",
                matchingIds: mango.tags.filter((id) => weaknessesTagesArr.includes(id.toString())).length,
            }))
            .sort((a, b) => b.matchingIds - a.matchingIds);

        let responceArr = await this.arrayService.getRandomSubarray(weaknessesSortedArr.slice(0, limit), Math.round(limit / 2))
        responceArr = [...responceArr, ...await this.arrayService.getRandomSubarray(strengthsSortedArr.slice(0, limit), Math.round(limit * 0.83 - responceArr.length))]
        responceArr = [...responceArr, ...await this.arrayService.getRandomSubarray(interestsSortedArr.slice(0, limit), Math.round(limit - responceArr.length))]
        responceArr = this.arrayService.filterUniqueObjectsArrray(responceArr)
        if (limit > responceArr.length) {
            let uniqueIds = responceArr.map(item => item._id)
            let newItemParams = {
                searchParams: {
                    _id: { $nin: uniqueIds },
                    type: type
                },
                populate:{ path: "tags", select: "name" }
            }
            responceArr = [...responceArr, ...await this.itemModel.find(newItemParams.searchParams).limit(limit - responceArr.length).populate(newItemParams.populate).lean()]
        }

        return responceArr
    }


}



