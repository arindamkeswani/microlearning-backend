import { Controller, Get, Query } from '@nestjs/common';
import { Pagination } from 'src/common/decorators';
import { DashboardsService } from './dashboards.service';
import { GetLeaderBoardDto, GetStudentDashboardDto } from './dto';

@Controller('dashboards')
export class DashboardsController {

    constructor( private dashboardService: DashboardsService ){}

    @Get('student-insights')
    async getStudentDashboard(
        @Query() q: GetStudentDashboardDto,
        @Pagination() p
    ) {
        return await this.dashboardService.getStudentDashboard(p.limit, p.offset);
    }

    @Get('/leaderboard')
    async getLeaderboard(
        @Query() query:GetLeaderBoardDto
    ){
        return this.dashboardService.getLeaderboard(query)
    }
}
