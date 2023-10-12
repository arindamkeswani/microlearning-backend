import { Body, Controller, Post } from '@nestjs/common';
import { createUserDto, loginUserDto } from './dto';
import { UserService } from './user.service';

const currentRoute = 'user';
@Controller(currentRoute)
export class UserController {
    constructor(
        private UserService: UserService
    ) { }

    @Post()
    async createUser(
        @Body() body: createUserDto
    ) {
        return await this.UserService.addUser(body);
    }

    @Post('login')
    async loginUser(
        @Body() body: loginUserDto
    ) {
        return await this.UserService.loginUser(body);
    }
}
