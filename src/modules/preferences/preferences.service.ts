import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Content } from 'src/schemas/content.schema';
import mongoose, { Types } from 'mongoose';
import { Activity } from 'src/schemas/activity.schema';
import { User } from 'src/schemas/users.schema';
const ObjectId = Types.ObjectId;
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PreferencesService {
    constructor(
        @InjectModel(Content.name)
        private contentModel: mongoose.Model<Content>,
        @InjectModel(Activity.name)
        private activityModel: mongoose.Model<Activity>,
        @InjectModel(User.name)
        private usersModel: mongoose.Model<User>,
    ) { }
    
    private readonly logger = new Logger(PreferencesService.name);

    @Cron('45 * * * * *')
    async updateUserTopics() {
        this.logger.debug('Cron Called when the current second is 45');

        let acitivities = await this.getActivities();    

        let studentWiseObj = await this.getStudentWiseData(acitivities);

        for(let i in studentWiseObj) {
            let student = studentWiseObj[i];
            let data = student['data'];
            let tagWiseAnswers = {};
            let attentionObj = {};

            for(let j in data) {
                let tags = data[j]['tags'];
                let attention = data[j]['attention'];

                let isContentAttempted = data[j]['isAnsCorrect'];
                
                if(isContentAttempted != null) {
                    for(let k in tags) {      
                        if(!tagWiseAnswers[tags[k]]) {
                            tagWiseAnswers[tags[k]] = {
                                correct: 0,
                                incorrect: 0
                            };
                        }
                        
                        if(isContentAttempted == true) {
                            tagWiseAnswers[tags[k]]['correct']++;
                        }
                        else {
                            tagWiseAnswers[tags[k]]['incorrect']++;
                        }
                        
                        tagWiseAnswers[tags[k]]['correctionPercentage'] = Number((((tagWiseAnswers[tags[k]]['correct'])/(tagWiseAnswers[tags[k]]['correct'] + tagWiseAnswers[tags[k]]['incorrect'])) * 100).toFixed(2));

                    }
                }
                

                for(let k in tags) {
                    if(!attentionObj[tags[k]]) {
                        attentionObj[tags[k]] = {
                            count: 0,
                            attention: 0 
                        };
                    }
                    attentionObj[tags[k]]['count']++;
                    attentionObj[tags[k]]['attention'] += attention;
                    attentionObj[tags[k]]['attentionAvg'] = Number((attentionObj[tags[k]]['attention'] / attentionObj[tags[k]]['count']).toFixed(2));
                }
                
            }
            student['tagWiseAnswers'] = tagWiseAnswers;
            student['attention'] = attentionObj;
            delete student['data'];
        }
        
        let studentWiseResults = await this.getStudentWiseResults(studentWiseObj);
        
        let response = [];
        
        for(let i in studentWiseResults) {
            let studentResult = studentWiseResults[i];
            let studentId = new ObjectId(i);
            
            let updatedResponse = await this.usersModel.findOneAndUpdate({
                _id: studentId 
            },{
                topics: studentResult
            });
            
            response.push(updatedResponse);
        }

        return response;
    }


    async getActivities() {
        let selectFields = { '__v': 0 };

        return await this.activityModel.find().populate({ path: "contentId", select: '_id tags'})
        .select(selectFields)
        .lean(); 
    }


    async getStudentWiseData(acitivities) {
        let studentWiseObj = {};
        
        for(let i in acitivities) {
            let acitivity = acitivities[i];
            let tags = acitivity['contentId']['tags'];
            let contentId = acitivity['contentId']['_id'];
            
            delete acitivity['contentId'];

            acitivity['tags'] = tags;
            acitivity['contentId'] = contentId;
            
            if(!studentWiseObj[acitivity['user']?.toString()]) {
                studentWiseObj[acitivity['user']?.toString()] = {
                    data: [],
                    tagWiseAnswers: {}
                };
            }

            studentWiseObj[acitivity['user']?.toString()]?.['data'].push(acitivity);   
        }

        return studentWiseObj;
    }


    async getStudentWiseResults(studentWiseObj) {
        let studentWiseResults = {};
        
        for(let i in studentWiseObj) {
            let strength = [];
            let weakness = [];
            let interest = [];

            let tagWise = studentWiseObj[i]['tagWiseAnswers'];
            let attention = studentWiseObj[i]['attention'];
            
            let sortTagWiseStrength = [];
            let sortTagWiseWeakness = [];

            for(let j in tagWise) {
                if(tagWise[j]['correctionPercentage'] >= 60){
                    sortTagWiseStrength.push([tagWise[j]['correctionPercentage'], tagWise[j], j]);
                }
                else {
                    sortTagWiseWeakness.push([tagWise[j]['correctionPercentage'], tagWise[j], j]);
                }
            }
            
            sortTagWiseStrength.sort(function(a,b) {
                return b[0] - a[0];
            });

            sortTagWiseWeakness.sort(function(a,b) {
                return a[0] - b[0];
            });

            let sortInterest = [];
            
            for(let j in attention) {
                sortInterest.push([attention[j]['attentionAvg'], attention[j], j]);
            }               

            sortInterest.sort(function(a,b) {
                return b[0] - a[0];
            });
            
            for(let j in sortTagWiseStrength) {
                strength.push({tag: sortTagWiseStrength[j][2], correct: sortTagWiseStrength[j][1]['correct'], incorrect: sortTagWiseStrength[j][1]['incorrect']});
            }

            for(let j in sortTagWiseWeakness) {
                weakness.push({tag: sortTagWiseWeakness[j][2], correct: sortTagWiseWeakness[j][1]['correct'], incorrect: sortTagWiseWeakness[j][1]['incorrect']});
            }

            for(let j in sortInterest) {
                interest.push({tag : sortInterest[j][2], attention: sortInterest[j][1]['attentionAvg']});
            }

            studentWiseResults[i] = {
                strengths: strength,
                weaknesses: weakness, 
                interests: interest
            };
        }

        return studentWiseResults;
    }
}
