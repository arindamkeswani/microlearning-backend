import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { AddContentEntryDto, GetFeedDto, RecordActivityDto } from './dto';
import { QuickLearningService } from './quick-learning.service'
import { CheckAnswerDto } from './dto/check-answer.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Pagination } from 'src/common/decorators';
 

@Controller('quick-learning')
export class QuickLearningController {
    constructor(private qlService: QuickLearningService){}

    @Post('content')
    async addNewContentEntry(
        @Body() body: AddContentEntryDto
    ){
        const postResponse = await this.qlService.addNewContentEntry(body);

        return postResponse;
    }

    @Post('record-activity')
    async recordStudentActivity(
        @Body() body: RecordActivityDto
    ) {
        const res = await this.qlService.recordStudentActivity(body);
        return res;
    }

    @Post('check')
    async checkAnswer(
        @Body() body: CheckAnswerDto
    ) {
        const res = await this.qlService.checkAnswer(body);

        let metadata = res.metadata;
        delete res.metadata;
        return {
            data: res,
            metadata
        };
    }

    @Patch('content')
    async updateContent(
        @Body() body: UpdateContentDto
    ) {
        return await this.qlService.updateContent(body);
    }

    @Get('feed')
    async getQlFeed(
        @Query() q: GetFeedDto,
        @Pagination() p
    ) {
        let {user} = q
        return await this.qlService.getQlFeed(user, p.limit);
    }

}
