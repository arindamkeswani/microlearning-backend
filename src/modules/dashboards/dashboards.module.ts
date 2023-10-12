import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from 'src/schemas/users.schema';

@Module({
  controllers: [DashboardsController],
  providers: [DashboardsService],
  imports: [
    MongooseModule.forFeature([
      // { name: Content.name, schema: ContentSchema },
      // { name: Activity.name, schema: ActivitySchema },
      { name: User.name, schema: UsersSchema }
    ]),
  ]
})
export class DashboardsModule {}
