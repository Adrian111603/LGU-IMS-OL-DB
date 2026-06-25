export type StoredFile = {
  storedName: string;
  storagePath: string;
  checksum: string;
};

export abstract class StorageService {
  abstract save(file: Express.Multer.File): Promise<StoredFile>;
  abstract resolve(storagePath: string): string;
}

