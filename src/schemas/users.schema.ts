import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Roles } from 'src/common/utils/enums';
import { Tag } from './tags.schema';

@Schema({ _id: false })
export class Interests {
    @Prop({ required: true, type: String, ref: Tag.name })
    tag: string

    @Prop({ required: true, type: Number})
    attention: number
}

@Schema({ _id: false })
export class Strengths {
    @Prop({ required: true, type: String, ref: Tag.name })
    tag: string

    @Prop({ required: true, type: Number})
    correct: number

    @Prop({ required: true, type: Number})
    incorrect: number
}

@Schema({ _id: false })
export class Weaknesses {
    @Prop({ required: true, type: String, ref: Tag.name })
    tag: string

    @Prop({ required: true, type: Number})
    correct: number

    @Prop({ required: true, type: Number})
    incorrect: number
}

@Schema({ _id: false })
export class Topics {
    //each key will store an array on tags
    @Prop({ required: true, type: [Object], default: [], ref: Tag.name })
    interests: Interests[];

    @Prop({ required: true, type: [Object], default: [], ref: Tag.name })
    strengths: Strengths[];

    @Prop({ required: true, type: [Object], default: [], ref: Tag.name })
    weaknesses: Weaknesses[];
}

@Schema({
    collection: 'users',
    timestamps: true,
})
export class User {
    @Prop({ required: true, unique: true })
    username: string;
    
    @Prop({ required: true, unique: true })
    contact: string;

    @Prop({ required: true, enum: Roles })
    role: Roles;

    @Prop({ required: false, type: Topics, default: null })
    topics: Topics;
}

export const UsersSchema = SchemaFactory.createForClass(User);
