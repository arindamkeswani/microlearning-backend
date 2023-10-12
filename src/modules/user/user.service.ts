import { HttpException, Injectable } from '@nestjs/common';
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
            contact: body.contact
        })
        .select(selectFields)
        .populate({ path: `topics.interests.tag`, select: "name" })
        .populate({ path: `topics.strengths.tag`, select: "name" })
        .populate({ path: `topics.weaknesses.tag`, select: "name" })
        .lean();
        
        if(!userDetails.length) {
            throw new HttpException('user not found', 404)
        }
        
        return userDetails;
    }

}
