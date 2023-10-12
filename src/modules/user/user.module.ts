import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from 'src/schemas/users.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [
		MongooseModule.forFeature([
		{ name: User.name, schema: UsersSchema }
	])
],
	controllers: [UserController],
	providers: [UserService]
})

export class UserModule { }
