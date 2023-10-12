import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ContentTypes, Languages } from "src/common/utils/enums";

export class GetFeedDto{
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    user: string;

    @IsOptional()
    limit: number

    @IsOptional()
    page: number   
}