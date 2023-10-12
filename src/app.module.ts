import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { CoreModule } from './core/core.module';
import { CLogger } from './bootstrap/logger.service';
import { AiModule } from './modules/ai/ai.module';
import { AwsModule } from './modules/aws/aws.module';
import { QuickLearningModule } from './modules/quick-learning/quick-learning.module';
import { UserModule } from './modules/user/user.module';
import { ItemsModule } from './modules/items/items.module';
import { TagsModule } from './modules/tags/tags.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardsModule } from './modules/dashboards/dashboards.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    CoreModule,
    AiModule,
    AwsModule,
    QuickLearningModule, 
    UserModule,
    ItemsModule,
    UserModule, 
    TagsModule, 
    PreferencesModule,
    ScheduleModule.forRoot(),
    DashboardsModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    CLogger
  ],
})
export class AppModule {}
