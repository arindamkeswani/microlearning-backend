import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ContentTypes, Languages } from "src/common/utils/enums";

export class GetStudentDashboardDto{
    // @IsOptional()
    limit: number | string

    // @IsOptional()
    page: number | string
}

export class GetLeaderBoardDto{
    @IsNotEmpty()
    @IsEnum({ADMIN:"admin",STUDENT:"student"})
    type:string

    @IsOptional()
    @IsMongoId()
    userId:string
}