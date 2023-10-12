import { Module } from "@nestjs/common";
import { CommonFunctions } from "./common-functions";
import { ArrayService } from "./array-functions";


@Module({
    providers:[CommonFunctions,ArrayService],
    exports:[CommonFunctions,ArrayService]
}
)

export class UtilsModule { }