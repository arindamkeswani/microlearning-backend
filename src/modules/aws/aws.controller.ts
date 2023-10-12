import { BadRequestException, Controller, Get, Patch, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { query, Request } from 'express';
import { AwsService } from './aws.service';
import { fetchS3FolderContentDto, GetPresignedUrlDto, GetObjectDto } from './dto';
import { S3Client } from '@aws-sdk/client-s3';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';


let route = 'aws/s3';
@Controller(route)
@ApiTags('AWS [TBA]')
export class AwsController {
	
	constructor(
		private awsService: AwsService,
		private configService: ConfigService
	) {}


	
	@Get('presigned-url')
	async getPresignedUrl(@Query() query: GetPresignedUrlDto) {

		// const credentials = await this.awsService.assumeRole();

        // const client  = new S3Client({ region : this.configService.get<string>('aws.s3.region') });
		
		if (query.key) {
			// query['bucket'] = this.BUCKET; //makeshift, to reduce refactoing
		    if ((query.type === 'put' || query.type == null) && query.contentType) {
		        return {
		            data: await this.awsService.getUploadUrl(query)
		        };
		    } 
		    else if (query.type === 'get') {
		        return {
		            data: await this.awsService.getDownloadUrl(query) 
		        };
		    }
		}
		
	}


	@Get('folder-content') 
	async fetchS3FolderContent(@Query() query : fetchS3FolderContentDto) {
		
		//const credentials = await this.awsService.assumeRole();

        // const client  = new S3Client({ region : this.configService.get<string>('aws.s3.region') });

	    return await this.awsService.fetchS3FolderContent(query.key);
	}

	// @Get('get-object')
	// async fetchObjectFromS3(
	// 	@Query() q: GetObjectDto
	// ) {
	// 	const input = {
	// 		Bucket: this.BUCKET,
	// 		Key: q.key
	// 	}

	// 	// this.awsService.getObject(input)

	// }
}  
