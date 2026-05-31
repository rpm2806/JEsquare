import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = path.join(
    process.cwd(),
    'uploads',
  );

  constructor() {
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created uploads directory: ${this.uploadDir}`);
    }
  }

  async upload(
    file: Buffer,
    originalName: string,
    subDir = 'general',
  ): Promise<{ filePath: string; fileName: string; url: string }> {
    const dir = path.join(this.uploadDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(originalName);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(dir, fileName);

    fs.writeFileSync(filePath, file);
    this.logger.log(`File uploaded: ${filePath}`);

    return {
      filePath,
      fileName,
      url: `/uploads/${subDir}/${fileName}`,
    };
  }

  async download(subDir: string, fileName: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, subDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    return fs.readFileSync(filePath);
  }

  async delete(subDir: string, fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, subDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    }
  }

  getFilePath(subDir: string, fileName: string): string {
    return path.join(this.uploadDir, subDir, fileName);
  }
}
