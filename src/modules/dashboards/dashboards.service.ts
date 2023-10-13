import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/users.schema';
import mongoose, { Types } from 'mongoose';
import { Activity } from 'src/schemas/activity.schema';
import { type } from 'os';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    @InjectModel(Activity.name)
        private activityModel: mongoose.Model<Activity>,
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

  async getLeaderboard(query){
    const fulllData= await this.getUsersSortedByCorrectAnswersCount()
    let returnDataLength=10
    if(query.type=="admin"){
        returnDataLength=fulllData.length
    }
    if(query.type=="student" && !query.userId){
        throw new HttpException('userId is required', 400)
    }

    let responceArr=[]
    fulllData.map((data,index)=>{
        let newObj={
            ...data,
            ranking:index+1,
            rewardPoints:data.correctAnswersCount*10
        }
        if(newObj._id==query.userId || index<10){
            responceArr.push(newObj) 
        }

    })
    return responceArr

  }
  async getUsersSortedByCorrectAnswersCount(): Promise<any[]> {
    const aggregationPipeline = [
      {
        $match: { isAnsCorrect: true },
      },
      {
        $group: {
            _id: '$user',
          correctAnswersCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          correctAnswersCount: -1,
        } as Record<string, 1 | -1>,
      },
      {
        $lookup: {
          from: 'users', 
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1, 
          correctAnswersCount: 1, 
          'user.username': 1, 
          'user._id': 1, 
        },
      },
    ];

    const sortedUsers = await this.activityModel.aggregate<any>(aggregationPipeline).exec();

    return sortedUsers;
  }
}
