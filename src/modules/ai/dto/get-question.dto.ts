import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Languages } from "src/common/utils/enums";

export class GenerateQuestionDto{
    @IsString()
    @IsNotEmpty()
    contentId: string;    

    @IsString()
    @IsNotEmpty()
    @IsEnum(Languages)
    language: Languages;    

    @IsString()
    @IsOptional()
    regenerate: string
    
    // @IsOptional()
    // limit: number

    // @IsOptional()
    // page: number
}