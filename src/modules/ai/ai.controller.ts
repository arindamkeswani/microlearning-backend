import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from "./ai.service"
import { GenerateTranscriptDto, GenerateQuestionDto } from './dto';

@Controller('ai')
export class AiController {
    constructor(private aiService: AiService ){}
    
    @Get('generate/transcript')
    async generateTranscriptFromVideo(
        @Query() q: GenerateTranscriptDto
    ){
        const contentId = q.contentId;
        const lang = q.language;
        const regenerate = q.regenerate && q.regenerate == "true" ? true: false
        const op = await this.aiService.getTranscriptFromContent(contentId, lang, regenerate);
        if(!op){
            throw new Error("Could not process your request at this time");
        }
        else {
            let metadata = op.metadata;
            delete op.metadata;
            return {
                data: op,
                metadata: metadata
            }
        }
        
    }

    @Get('generate/question')
    async generateQuestionFromTranscript(
        @Query() q: GenerateQuestionDto
    ){
        const contentId = q.contentId;
        const language = q.language;
        const regenerate = q.regenerate && q.regenerate == "true" ? true: false
        const op = await this.aiService.getQuestionFromTranscript(contentId, language, regenerate);
        if(!op){
            throw new Error("Could not process your request at this time");
        }
        else {
            let metadata = op.metadata;
            delete op.metadata;
            return {
                data: op,
                metadata: metadata
            }
        }
        
    }

    @Get('generate/tags')
    async generateTagsFromTranscript(
        @Query() q: GenerateQuestionDto
    ){
        // const contentId = q.contentId;
        // const op = await this.aiService.getQuestionFromTranscript(contentId);
        // if(!op){
        //     throw new Error("Could not process your request at this time");
        // }
        // else {
        //     let metadata = op.metadata;
        //     delete op.metadata;
        //     return {
        //         data: op,
        //         metadata: metadata
        //     }
        // }
        
    }


}
