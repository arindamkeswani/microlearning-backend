import { Module } from "@nestjs/common";
import { CommonFunctions } from "./common-functions";


@Module({
    providers:[CommonFunctions],
    exports:[CommonFunctions]
}
)

export class UtilsModule { }