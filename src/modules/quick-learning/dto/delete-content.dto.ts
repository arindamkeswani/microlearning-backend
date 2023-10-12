import { IsNotEmpty } from "class-validator";

export class DeleteTagsDto{
    @IsNotEmpty()
    id: string[] | string;   
}