import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ContentTypes, Languages } from "src/common/utils/enums";

export class UpdateContentDto{

    @IsMongoId()
    @IsString()
    @IsNotEmpty()
    id: string

    @IsArray()
    @ArrayNotEmpty()
    tags: [string];   

    @IsString()
    @IsNotEmpty()
    @IsEnum(Languages)
    language: Languages;

    @IsObject()
    @IsNotEmptyObject()
    transcript: object

    @IsObject()
    @IsNotEmptyObject()
    options: object

    @IsObject()
    @IsNotEmptyObject()
    correctOptionIdx: object

    @IsObject()
    @IsNotEmptyObject()
    question: object

}