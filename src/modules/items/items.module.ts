import { Module } from "@nestjs/common";
import { ItemService } from "./items.service";
import { ItemsController } from "./items.controller";
import { ApisModule } from 'src/common/apis/apis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema, item } from "src/schemas/items.schema";

@Module({
    controllers: [ItemsController],
    providers: [ItemService],
    imports: [
        ApisModule,
        MongooseModule.forFeature([
          { name: item.name, schema: ItemSchema }
        ]),
      ]
})

export class ItemsModule{}