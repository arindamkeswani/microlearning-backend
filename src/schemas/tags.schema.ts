import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    collection: "tags",
    timestamps: true
})
export class Tag {

    @Prop({required: true, unique: true})
    name: string;

    @Prop({ required: false, type: [String] })
    content: String[];

}

export const TagSchema = SchemaFactory.createForClass(Tag);