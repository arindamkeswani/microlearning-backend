import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ContentTypes, Languages } from 'src/common/utils/enums';
import { Tag } from './tags.schema';


@Schema({ _id: false })
export class Transcript {
    
    @Prop({ required: true, type: String, default: null })
    en: string;

    @Prop({ required: true, type: String, default: null })
    hi: string;
    
}


@Schema({ _id: false })
export class Question {
    
    @Prop({ required: true, type: String, default: null })
    en: string;

    @Prop({ required: true, type: String, default: null })
    hi: string;

}

@Schema({ _id: false })
export class Options {
    
    @Prop({ required: true, type: Types.Array , default: null })
    en: Types.Array<string>;

    @Prop({ required: true, type: Types.Array , default: null })
    hi: Types.Array<string>;

}

@Schema({ _id: false })
export class CorrectOption {
    
    @Prop({ required: true, type: Number, default: null })
    en: number;

    @Prop({ required: true, type: Number, default: null })
    hi: number;
    
}

@Schema({
    collection: 'content',
    timestamps: true,
})
export class Content {
    @Prop({ required: true, enum: ContentTypes, default: ContentTypes.VIDEO })
    type: ContentTypes;

    @Prop({ required: false, type: String })
    caption: string;

    @Prop({ required: true, type: Types.ObjectId })
    uploadedBy: Types.ObjectId;

    @Prop({ required: false, type: String, default: null })
    language: Languages;
    
    @Prop({ required: false, type: Transcript })
    transcript: Transcript;

    @Prop({ required: false, type: Question })
    question: Question;

    @Prop({ required: false, type: Types.Array })
    options: Options;

    //Store index of correct option
    @Prop({required: false, type: CorrectOption})
    correctOptionIdx: CorrectOption;

    @Prop({required: false, type: [Types.ObjectId], default: [], ref: Tag.name})
    tags: Types.ObjectId[];

}

export const ContentSchema = SchemaFactory.createForClass(Content);
