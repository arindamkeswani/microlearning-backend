import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ContentTypes, Languages } from "src/common/utils/enums";

export class CheckAnswerDto{
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    contentId: string;   

    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    user: string;   
    
    @IsString()
    @IsNotEmpty()
    @IsEnum(Languages)
    language: Languages;

    //this will be index of the ans from the options array
    @IsNumber()
    selectedOptionIdx: number
}