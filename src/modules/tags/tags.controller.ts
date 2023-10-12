import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { createTagsDto, createTagsMapDto, deleteTagsDto, getTagsDto } from './dto';
import { TagsService } from './tags.service';

const currentRoute = 'tags';
@Controller(currentRoute)
export class TagsController {
    constructor(private tagsService: TagsService){}
    
    @Get()
    async getTags(
        @Query() query: getTagsDto
    ) {
        return await this.tagsService.getTags(query);
    }

    @Post() 
    async createTags(
        @Body() body: createTagsDto
    ) {         
        return await this.tagsService.createTags(body);
    } 

    @Post('map')
    async createTagsMap(
        @Body() body: createTagsMapDto
    ) {
        return await this.tagsService.createTagsMap(body);
    }

    @Delete()
    async deleteTag(@Body() body: deleteTagsDto){
        return await this.tagsService.deleteTags(body);
    }
}
