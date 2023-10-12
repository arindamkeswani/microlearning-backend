import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
import { Content, ContentSchema } from 'src/schemas/content.schema';
import { User, UsersSchema } from 'src/schemas/users.schema';
import { PreferencesController } from './preferences.controller';
import { PreferencesService } from './preferences.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: User.name, schema: UsersSchema }
    ])
  ],
  controllers: [PreferencesController],
  exports: [PreferencesService],
  providers: [PreferencesService]
})
export class PreferencesModule { }
