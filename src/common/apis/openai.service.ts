import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpUtilService } from '../http-utils/http-utils';
import * as fs from 'fs';

import OpenAI from 'openai';
import { Languages } from '../utils/enums';

@Injectable()
export class OpenAiService {
  // private BASE_URL: string;
  // private API_KEY: string;
  private openai;
  constructor(
    private configService: ConfigService,
    private httpUtilService: HttpUtilService,
  ) {
    // this.BASE_URL = this.configService.get('openAi').baseUrl;
    // this.API_KEY = this.configService.get('openAi').apiKey;
    this.openai = new OpenAI(this.configService.get('openAi').apiKey);
  }

  async getTranscript(filePath: string, language: string | null | undefined) {
    // const url = this.BASE_URL + `/v1/audio/transcriptions`;
    // const headers = {
    //   'Content-Type': 'multipart/form-data',
    //   Authorization: `Bearer ${this.API_KEY}`,
    // };

    const data = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      language: language || Languages.ENGLISH,
    });

    if (data.isError) {
      return null;
    }

    return data.data ? data.data : data;
  }

  async getChatResponse(prompt: string) {
    const data = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a smart assistant with expertise in making educational questions for students in a desired format.',
        },
        { role: 'user', content: prompt },
      ],
    });

    if (data.isError) {
      return null;
    }

    return data.data ? data.data : data;
  }

  private async readFileToBuffer(filePath: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      const chunks: any[] = [];

      fileStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      fileStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  }
}
