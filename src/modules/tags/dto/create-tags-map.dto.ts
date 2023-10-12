import { IsNotEmpty } from "class-validator";


export class createTagsMapDto {
    
    @IsNotEmpty()
    id: [string] | string
    
    @IsNotEmpty()
    content: string
}
