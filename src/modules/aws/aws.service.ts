import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
} from '@aws-sdk/client-s3';
import { URL_EXPIRATION_SECONDS } from '../../common/utils/constants';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { ConfigService } from '@nestjs/config';
import { type } from 'os';

@Injectable()
export class AwsService {
  private BUCKET;
  private S3_CLIENT;
  constructor(private readonly configService: ConfigService) {
    this.S3_CLIENT = new S3Client({
      region: this.configService.get<string>('aws.s3.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.s3.accessKeyId'),
        secretAccessKey: this.configService.get<string>(
          'aws.s3.secretAccessKey',
        ),
      },
    });
    this.BUCKET = this.configService.get<string>('aws.s3.bucket');
  }

  async getUploadUrl(event) {
    const Key = event.key;
    const bucketName = this.BUCKET;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: Key,
    });

    const uploadURL = await getSignedUrl(this.S3_CLIENT, command, {
      expiresIn: URL_EXPIRATION_SECONDS,
    });

    return {
      uploadURL: uploadURL,
      Key,
    };
  }

  async getDownloadUrl(event) {
    const Key = event.key;
    const bucketName = this.BUCKET;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: Key,
    });

    const downloadURL = await getSignedUrl(this.S3_CLIENT, command, {
      expiresIn: URL_EXPIRATION_SECONDS,
    });

    return {
      downloadURL: downloadURL,
      Key,
    };
  }

  async fetchS3FolderContent(key) {

    let fileNames: string[] = [];

    const input = {
      Bucket: this.BUCKET,
      MaxKeys: 1000,
      Prefix: key || null,
    };

    const command = new ListObjectsCommand(input);

    const cmdResponse = await this.S3_CLIENT.send(command);

    const folderContents = cmdResponse.Contents;
    fileNames = folderContents
      ? folderContents.map((file) => {
          return file.Key.replace(key, '');
        })
      : [];

    return {
      data: fileNames,
    };
  }

  async getObject(key) {
    const input = {
      Bucket: this.BUCKET,
      Key: key,
    };
    const command = new GetObjectCommand(input);
    const response = await this.S3_CLIENT.send(command);
    return response;
  }
}
