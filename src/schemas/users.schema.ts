import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Roles } from 'src/common/utils/enums';


@Schema({ _id: false })
export class Topics {
    //each key will store an array on tags
    @Prop({ required: true, type: [String], default: [] })
    interests: String[];

    @Prop({ required: true, type: [String], default: [] })
    strengths: String[];

    @Prop({ required: true, type: [String], default: [] })
    weaknesses: String[];
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
