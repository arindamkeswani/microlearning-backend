import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Languages } from 'src/common/utils/enums';
import { Content, ContentSchema } from './content.schema';
import { User } from './users.schema';

@Schema({
    collection: 'activity',
    timestamps: true,
})
export class Activity {
    @Prop({ required: true, type: Types.ObjectId, ref: Content.name })
    contentId: Content;

    @Prop({ required: true, type: Types.ObjectId })
    user: Types.ObjectId;

    // @Prop({ required: true, type: Languages })
    // language: Languages;

    //Between 0 & 100
    @Prop({ required: true, type: Number, default: 0 })
    attention: number
    
    @Prop({ required: false, type: Boolean, default: null })
    isAnsCorrect: boolean;
  
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);