import { IsNotEmpty } from "class-validator";


export class getTagsDto {
    
    @IsNotEmpty()
    q: [string] | string
    
}
