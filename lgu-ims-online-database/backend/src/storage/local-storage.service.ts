import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { extname, join, normalize } from 'path';
import { StorageService, StoredFile } from './storage.service';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir: string;

  constructor(config: ConfigService) {
    this.uploadDir = config.get<string>('UPLOAD_DIR') ?? './uploads';
    mkdirSync(this.uploadDir, { recursive: true });
  }

  async save(file: Express.Multer.File): Promise<StoredFile> {
    const extension = extname(file.originalname).toLowerCase();
    const storedName = `${randomUUID()}${extension}`;
    const storagePath = normalize(join(this.uploadDir, storedName));
    writeFileSync(storagePath, file.buffer);
    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    return { storedName, storagePath, checksum };
  }

  resolve(storagePath: string) {
    const normalized = normalize(storagePath);
    if (!normalized.startsWith(normalize(this.uploadDir))) return '';
    return normalized;
  }
}

