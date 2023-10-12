import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ContentTypes, Languages } from "src/common/utils/enums";

export class AddContentEntryDto{
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    uploadedBy: string;    

    @IsString()
    @IsNotEmpty()
    @IsEnum(ContentTypes)
    type: ContentTypes;

    @IsString()
    @IsNotEmpty()
    @IsEnum(Languages)
    @IsOptional()
    language?: Languages;

    // @IsOptional()
    // limit: number

    // @IsOptional()
    // page: number
}