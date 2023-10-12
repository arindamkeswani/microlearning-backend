import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createUserDto, loginUserDto } from './dto';
import * as mongoose from "mongoose";
import { Types } from "mongoose";
import { User } from 'src/schemas/users.schema';
const ObjectId = Types.ObjectId;

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private usersModel: mongoose.Model<User>,
    ) { }

    async addUser(body: createUserDto) {
        return await this.usersModel.create(body);
    }
    
    async loginUser(body: loginUserDto) {
        let selectFields = { '__v': 0 };

        let userDetails = await this.usersModel.find({
            username: body.username
        })
        .select(selectFields)
        .lean();
        
        return userDetails;
    }

}
