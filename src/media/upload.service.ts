/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import * as multerS3 from 'multer-s3';
import * as sharp from 'sharp';
import * as dotenv from 'dotenv';
import * as multer from 'multer';
import {
  PutObjectCommand,
  S3Client,
  ObjectCannedACL,
} from '@aws-sdk/client-s3'; // Import ObjectCannedACL

dotenv.config(); // Load environment variables

@Injectable()
export class UploadService {
  private s3: S3Client; // Use the S3Client for v3
  private bucketName: string;
  public storage: multer.StorageEngine;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!this.bucketName) {
      throw new Error(
        'AWS_S3_BUCKET_NAME is not defined in environment variables.',
      );
    }

    console.log('AWS_S3_BUCKET_NAME:', this.bucketName);

    this.storage = multerS3({
      s3: this.s3,
      bucket: this.bucketName,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, `uploads/${fileName}`);
      },
    });
  }

  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: `uploads/${Date.now()}-${fileName}`,
      Body: buffer,
      ACL: ObjectCannedACL.public_read,
      ContentType: 'image/jpeg',
    };

    console.log('Uploading to bucket:', this.bucketName);

    // Use PutObjectCommand in v3
    const command = new PutObjectCommand(uploadParams);
    const data = await this.s3.send(command);
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  }

  async resizeImage(filePath: string): Promise<Buffer> {
    return sharp(filePath)
      .resize(800, 600, { fit: 'inside' })
      .toFormat('jpeg')
      .toBuffer();
  }
}
