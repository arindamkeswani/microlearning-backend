import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ItemService } from "./items.service";
import { CreateItemDto, MongoIdDto } from "./dto/itmes.dto";

@Controller('items')
export class ItemsController{
    constructor(
        private itemService:ItemService
    ){}

    @Get()
    async getItemList(
        @Query() query:any
    ){
        return  this.itemService.getItemList(query)
    }

    @Post()
    async addItem(
        @Body() body: CreateItemDto,
    ){
        return this.itemService.addItem(body)
    }

    @Put('/:id')
    async updateItem(
        @Body() Body:any,
        @Param() param:MongoIdDto

    ){
        return this.itemService.updateItem(Body,param)
    }

    @Delete('/:id')
    async deleteItem(
        @Param() param :MongoIdDto
    ){
        return this.itemService.deleteItem(param)
    }
}