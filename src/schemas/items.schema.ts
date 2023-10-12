import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ItemTypes } from "src/common/utils/enums";

@Schema({
    collection: "items",
    timestamps: true
})
export class item {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;


    @Prop({ required: true })
    urls: string[];


    @Prop({ required: true })
    price: number;

    @Prop({ required: false })
    discount: number;

    @Prop({ required: true, type: [String] })
    tags: String[];

    @Prop({ required: true, type: String, enum: ItemTypes })
    type: String;


}

export const ItemSchema = SchemaFactory.createForClass(item);