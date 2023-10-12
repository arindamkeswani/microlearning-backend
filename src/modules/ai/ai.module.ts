import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ApisModule } from 'src/common/apis/apis.module';
import { AwsModule } from '../aws/aws.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from 'src/schemas/content.schema';

@Module({
  controllers: [AiController],
  providers: [AiService],
  imports: [
    ApisModule,
    AwsModule,
    MongooseModule.forFeature([{ name: Content.name, schema: ContentSchema }]),
  ],
})
export class AiModule {}
