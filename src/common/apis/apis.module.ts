import { Module } from "@nestjs/common";
import { OpenAiService } from "./openai.service";
import { HttpUtilService } from "../http-utils/http-utils";


@Module({
    providers:[OpenAiService, HttpUtilService],
    exports:[OpenAiService, HttpUtilService]
}
)

export class ApisModule { }