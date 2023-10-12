import { IsNotEmpty } from "class-validator";


export class createTagsDto {
    
    @IsNotEmpty()
    name: [string] | string
    
}
