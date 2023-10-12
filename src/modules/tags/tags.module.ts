import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from 'src/schemas/tags.schema';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  imports: [
    MongooseModule.forFeature([
		{ name: Tag.name, schema: TagSchema }
	  ])
  ],
  controllers: [TagsController],
  exports: [TagsService],
  providers: [TagsService]
})

export class TagsModule {}
