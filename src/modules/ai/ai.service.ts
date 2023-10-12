const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
import mongoose, { Types } from 'mongoose';
import * as fs from 'fs';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MEDIA_BASE_FOLDER,
  EXT,
  S3_ROUTES,
  // QUESTION_GEN_PROMPT,
  SEPARATOR,
  getTranslationPrompt,
  getQuestionGenerationPrompt,
} from '../../common/utils/constants';
import { OpenAiService } from 'src/common/apis/openai.service';
import { AwsService } from '../aws/aws.service';
import { HttpUtilService } from 'src/common/http-utils/http-utils';
import { Content } from 'src/schemas/content.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Languages } from 'src/common/utils/enums';

ffmpeg.setFfmpegPath(path.join('node_modules', 'ffmpeg-static', 'ffmpeg'));

@Injectable()
export class AiService {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly awsService: AwsService,
    private readonly http: HttpUtilService,
    @InjectModel(Content.name)
    private readonly contentModel: mongoose.Model<Content>,
  ) {}

  async getTranscriptFromContent(
    contentId: string,
    language: Languages,
    regenerate: boolean,
  ) {
    //check if content is already present, if present, do not move further
    let transcript;
    let source;
    const contentObj = {};
    let updationResponse;
    //get transcript
    const existingContent: any = await this.contentModel.findOne(
      { _id: contentId },
      'transcript language',
    );
    // console.log(Object.keys(Languages))
    // return null
    //check if current language's transcript is present in the DB
    if (
      existingContent.transcript &&
      existingContent.transcript[language] &&
      !regenerate
    ) {
      transcript = existingContent.transcript[language];
      // contentObj['transcript'] = transcript;
      source = 'db';
    } else {
      console.log('Generating new transcript...');

      //check if this is initial transcript generation or if this is a translation
      //Check if original language has been assigned, if not, assume it to be original language
      const isOriginalLanguage =
        !existingContent.language || existingContent.language == language;
      console.log(
        'Has original lang been assigned: ',
        existingContent.language,
      );
      console.log(
        'Is the input lang the original language',
        existingContent.language == language,
      );
      //if it is original language,
      if (isOriginalLanguage) {
        console.log('Generating transcript for original language...');

        //generate transcript if it does not exist OR is regeneration is forced
        //download video to server and store using filename
        const downloadSuccess = await this.downloadVideoFromS3(contentId);
        if (!downloadSuccess) {
          return null;
        }

        //convert to audio
        const isFileConverted = await this.saveAudioToServer(contentId);
        console.log('Has file been converted to audio? ', isFileConverted);

        if (!isFileConverted) {
          return null;
        }

        transcript = await this.generateAudioTranscription(contentId, language);
        if (!transcript.text) {
          return null;
        }
        transcript = transcript.text
        contentObj[`language`] = language;
      } else {
        //this is a translated transcript
        console.log('Generating transcript for translated language...');

        const originalTranscript =
          existingContent.transcript[`${existingContent.language}`];
        const prompt = getTranslationPrompt(
          existingContent.language,
          language,
          originalTranscript,
        );
        const generatedDataObj = await this.openAiService.getChatResponse(
          prompt,
        );

        transcript = generatedDataObj.choices[0].message.content; //added extra nesting to keep format consistent;
      }

      contentObj[`transcript.${language}`] = transcript;
      source = 'new';

      // Updation of DB with aforementioned data
      updationResponse = source == 'new' ? await this.saveGeneratedContentInDb(
        contentId,
        contentObj,
      ) : "N/A";
    }

    //Clean-up of files
    const cleanUpResult =
      source == 'new' ? await this.cleanupFiles(contentId) : 'N/A';
    return {
      transcript: transcript,
      // questionInfo: quesObj,
      metadata: {
        transcriptGeneration: { success: transcript.text ? true : false },
        transcriptUpdation: updationResponse,
        // contentGeneration: { success: quesObj.q?.length > 0 ? true: false },
        cleanup: { success: cleanUpResult },
        source,
      },
    };
  }

  async getQuestionFromTranscript(
    contentId: string,
    language: Languages,
    regenerate: boolean,
  ) {
    let contentObj: any = {};
    let source;
    let updationResponse;
    const existingContent = await this.contentModel.findOne(
      { _id: contentId },
      'transcript question options correctOptionIdx',
    );

    if (!existingContent) {
      throw new BadRequestException(
        'Please verify that the content which you have selected is valid',
      );
    }

    //Not destructuring due to default null value
    const transcript = existingContent.transcript;
    const question = existingContent.question;
    const options = existingContent.options;
    const correctOptionIdx = existingContent.correctOptionIdx;

    if (transcript && transcript[language]) {
      if (
        question &&
        question[language]?.length > 0 &&
        options &&
        options[language]?.length > 0 &&
        correctOptionIdx &&
        correctOptionIdx[language] != null &&
        regenerate == false
      ) {
        //check if question exists
        contentObj = {
          question,
          options,
          correctOptionIdx,
        };
        source = 'db';
      } else {
        //generate question
        //Get Question+Options+Correct based on the transcript using the prompt
        const quesObj = await this.generateQuestionFromTranscription(
          transcript[language],
          language,
        );
        const { q, options, ansIdx } = quesObj;

        contentObj  = {
          [`question.${language}`]: q,
          [`options.${language}`]: options,
          [`correctOptionIdx.${language}`]: Number.isNaN(ansIdx)
            ? null
            : ansIdx,
        };

        // Updation of DB with aforementioned data
        updationResponse = await this.saveGeneratedContentInDb(
          contentId,
          contentObj,
        );

        //handling format
        contentObj["question"] = {}; contentObj["question"][language] = contentObj[`question.${language}`]
        contentObj["options"] = {}; contentObj["options"][language] = contentObj[`options.${language}`]
        contentObj["correctOptionIdx"] = {};  contentObj["correctOptionIdx"][language] = contentObj[`correctOptionIdx.${language}`]

        delete contentObj[`question.${language}`];
        delete contentObj[`options.${language}`];
        delete contentObj[`correctOptionIdx.${language}`];

        source = 'new';
      }
    } else {
      throw new BadRequestException(
        'Transcript needs to be generated in the selected language before creating question',
      );
    }

    return {
      ...contentObj,
      metadata: {
        source,
        updatedInDb: updationResponse
          ? updationResponse.modifiedCount > 0
          : 'N/A',
      },
    };
  }

  async getUntranscribedVideoUrl(key) {
    // const file = fs.createWriteStream('file.jpg');
  }

  async downloadVideoFromS3(contentId): Promise<boolean> {
    const fileName = `${contentId}.${EXT.video}`;

    const s3Key = S3_ROUTES.video + fileName;
    const outputFilePath = this.getFilePath(contentId, EXT.video);

    const { Body } = await this.awsService.getObject(s3Key);
    const arr = await Body.transformToByteArray();
    return new Promise((resolve, reject) => {
      try {
        console.log("Media folder exists: ", fs.existsSync(MEDIA_BASE_FOLDER));
        if(!fs.existsSync(MEDIA_BASE_FOLDER)) {
          console.log("Creating media folder");
          fs.mkdirSync(MEDIA_BASE_FOLDER)
        }
        fs.writeFileSync(outputFilePath, arr);

        const fileExists = fs.existsSync(outputFilePath);
        if (fileExists) {
          resolve(true);
        }
      } catch (e) {
        console.log(e);
        return new Promise((resolve, reject) => {
          resolve(false);
        });
      }
      //default
      resolve(false);
    });
  }

  async saveAudioToServer(contentId: string): Promise<boolean> {
    const inputFilePath = this.getFilePath(contentId, EXT.video);
    const outputFilePath = this.getFilePath(contentId, EXT.audio);

    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .outputOptions('-vn', '-ab', '128k', '-ar', '44100')
        .toFormat('mp3')
        .save(outputFilePath)
        .on('error', (e) => {
          console.log(`Error converting file: ${e}`);
          return resolve(false);
        })
        .on('end', () => {
          console.log(`Converted Video to Audio [ID: ${contentId}]`);

          resolve(true);
        });
    });
  }

  private getFilePath(fileName: string, ext: string) {
    return `${MEDIA_BASE_FOLDER}${fileName}.${ext}`;
  }

  async generateAudioTranscription(fileName, lang) {
    const inputFilePath = this.getFilePath(fileName, EXT.audio);
    const transcript = await this.openAiService.getTranscript(
      inputFilePath,
      lang,
    );

    return transcript;
  }

  async generateQuestionFromTranscription(
    transcript: string,
    targetLanguage: Languages,
  ) {
    const fullPrompt = getQuestionGenerationPrompt(targetLanguage, transcript);
    // console.log(fullPrompt);
    const generatedDataObj = await this.openAiService.getChatResponse(
      fullPrompt,
    );

    let generatedResponse = generatedDataObj.choices[0].message.content;
    generatedResponse = await this.cleanGeneratedContent(generatedResponse);

    const generatedResponseSplit = generatedResponse.split(SEPARATOR);

    const quesObj = {
      q: generatedResponseSplit[0] || '',
      options: generatedResponseSplit.slice(1, 5) || ['', '', '', ''],
      ansIdx: generatedResponseSplit[generatedResponseSplit.length - 1] || null,
    };

    return quesObj;
  }

  async cleanGeneratedContent(content): Promise<string> {
    //Remove extra newlines;
    const resultString = content.replace(/\n+/g, '\n');
    return resultString;
  }

  async saveGeneratedContentInDb(contentId, contentObj) {
    const filter = {
      _id: contentId,
    };
    const updationResponse = await this.contentModel.updateOne(
      filter,
      contentObj,
    );

    return updationResponse;
  }

  async cleanupFiles(contentId: string) {
    const audioFilePath = MEDIA_BASE_FOLDER + contentId + '.' + EXT.audio;
    const videoFilePath = MEDIA_BASE_FOLDER + contentId + '.' + EXT.video;
    const files = [audioFilePath, videoFilePath];

    try {
      for (let i = 0; i < files.length; i++) {
        fs.unlinkSync(files[i]);
      }
    } catch (err) {
      return err.stack;
    }

    return true;
  }

  syncWait(ms) {
    let start = Date.now(),
      now = start;
    while (now - start < ms) {
      now = Date.now();
    }
  }
}
