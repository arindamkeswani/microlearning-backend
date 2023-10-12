import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { ItemTypes } from "src/common/utils/enums";

export class CreateItemDto{
    @IsNotEmpty()
    name:string
    
    @IsNotEmpty()
    description: string

    @IsNotEmpty()
    urls: string[]

    @IsNotEmpty()
    price:number


    @IsNotEmpty()
    discount:number

    @IsNotEmpty()
    tags:[]

    @IsNotEmpty()
    @IsEnum(ItemTypes)
    type:string


}

export class MongoIdDto{
    @IsNotEmpty()
    @IsMongoId()
    id:string
}
