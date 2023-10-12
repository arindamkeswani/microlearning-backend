import { IsString, ValidationOptions, ValidationArguments, registerDecorator, IsNotEmpty } from "class-validator";


export class GetObjectDto {
    @IsString()
    @IsNotEmpty()
    key : string;
    // @IsString()
    // @EndsWith('/', { message : `key must end with /` })
    // key : string;
}