import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ItemTypes } from "src/common/utils/enums";
import { Tag } from "./tags.schema";
import mongoose, { Types } from 'mongoose';

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

    @Prop({ required: true, type: [String] ,ref:Tag.name})
    tags: Tag[];

    @Prop({ required: true, type: String, enum: ItemTypes })
    type: String;

    @Prop({ required: true, type: Types.Decimal128 })
    rating: mongoose.Decimal128;



}

export const ItemSchema = SchemaFactory.createForClass(item);