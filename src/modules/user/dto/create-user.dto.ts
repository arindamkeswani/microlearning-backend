import { IsNotEmpty } from "class-validator";
import { Roles } from "src/common/utils/enums";


export class createUserDto {
    @IsNotEmpty()
    username: string
    
    @IsNotEmpty()
    role: Roles       
}