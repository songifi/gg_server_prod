// Type definitions for Express Multer
import { Multer as MulterNS } from 'multer';

declare global {
  namespace Express {
    export interface Multer extends MulterNS {
      File: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      };
    }
  }
}
