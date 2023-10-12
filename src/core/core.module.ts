import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/env.config";
import { HttpModule } from "@nestjs/axios";
import { HttpConfigService } from "src/bootstrap/http.config.service";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoDBConfigService } from "src/bootstrap/mongodb.config.service";
import { CLogger } from "src/bootstrap/logger.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
            envFilePath: ".env"
        }),
        HttpModule.registerAsync({
            imports: [ConfigModule],
            useClass: HttpConfigService
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useClass: MongoDBConfigService
        })
    ],
    providers: [CLogger],
    exports: [ConfigModule, HttpModule, MongooseModule]

})
export class CoreModule{}
