import { ArrayNotEmpty, IsArray, IsEmail, IsMongoId, IsNegative, IsNotEmpty, IsNumber, IsOptional, IsPositive, isString, IsString, IsUrl, Validate, validate, ValidateIf, ValidateNested, IsEnum, IsEmpty } from "class-validator";
import { GetPresignedUrlEnum } from "src/common/utils/enums";


export class GetPresignedUrlDto {
    @IsString()
    @IsNotEmpty()
    key: string;
  
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    bucket?: string;
  
    @IsOptional()
    @IsEnum(GetPresignedUrlEnum)
    type: GetPresignedUrlEnum;
  
    @IsOptional()
    @IsString()
    contentType: string;
}