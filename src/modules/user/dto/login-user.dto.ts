import { IsNotEmpty } from "class-validator";

export class loginUserDto {
    @IsNotEmpty()
    username: string
}