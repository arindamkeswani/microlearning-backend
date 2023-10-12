import { IsNotEmpty } from "class-validator";


export class deleteTagsDto {
    
    @IsNotEmpty()
    id: [string] | string
    
}
