import { Module } from '@nestjs/common';
import { QuickLearningController } from './quick-learning.controller';
import { QuickLearningService } from './quick-learning.service';
import { ApisModule } from 'src/common/apis/apis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from 'src/schemas/content.schema';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';

@Module({
  controllers: [QuickLearningController],
  providers: [QuickLearningService],
  imports: [
    ApisModule,
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: Activity.name, schema: ActivitySchema }
    ]),
  ]
})
export class QuickLearningModule {}
