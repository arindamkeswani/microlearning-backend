
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ContentTypes, Languages } from "src/common/utils/enums";

export class RecordActivityDto{
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    user: string;    

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    contentId: string;

    @IsNumber()
    attention: number

    // @IsOptional()
    // isAnsCorrect?: boolean | null
}