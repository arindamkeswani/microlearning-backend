import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/users.schema';
import mongoose, { Types } from 'mongoose';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async getStudentDashboard(limit, offset) {
    //get strenghts, weaknesses, interests (populate tags)
    let students = await this.userModel
      .find({ role: "student" }, "username contact topics")
      .limit(limit)
      .skip(offset)
      .populate({ path: 'topics.strengths.tag', select: '_id name' })
      .populate({ path: 'topics.interests.tag', select: '_id name' })
      .populate({ path: 'topics.weaknesses.tag', select: '_id name' })
      .lean();

    students = students.map((row) => {
      let strengths;
      let weaknesses;
      let interests;
      if (row.topics?.strengths?.length > 0) {
        strengths = row.topics.strengths.map((row) => {
          const tagVal =
            row.tag && row.tag.length > 0 ? row.tag[0] : { name: 'N/A' };
            console.log(tagVal);
          return {
            ...row,
            tag: tagVal,
          };
        });
      }
      if (row.topics?.weaknesses?.length > 0) {
        weaknesses = row.topics.weaknesses.map((row) => {
            console.log("W", row.tag);
            
          const tagVal =
            row.tag && row.tag.length > 0 ? row.tag[0] : { name: 'N/A' };

          let newRow = {
            ...row,
            tag: tagVal,
          }
          return newRow;
        });
      }
      if (row.topics?.interests?.length > 0) {
        interests = row.topics.interests.map((row) => {
            console.log("I", row.tag);
          const tagVal =
            row.tag && row.tag.length > 0 ? row.tag[0] : { name: 'N/A' };
            console.log(tagVal)
          return {
            ...row,
            tag: tagVal,
          };
        });
      }

      return {
        ...row,
        "topics": {
            interests,
            strengths,
            weaknesses
        },
      };
    });

    return students;
  }
}
