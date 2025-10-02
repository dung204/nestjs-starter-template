import { S3Client } from 'bun';

export class StorageService {
  constructor(private readonly client: S3Client) {}

  async uploadFile(file: Express.Multer.File, folder?: string) {
    const timestamp = new Date().toISOString();
    const uuid = Bun.randomUUIDv7();

    const originalName = this.sanitizeFileName(file.originalname as string);

    const savedFileName = folder
      ? `${folder}/${timestamp}-${uuid}-${originalName}`
      : `${timestamp}-${uuid}-${originalName}`;

    await this.client.file(savedFileName).write(Buffer.from(file.buffer));
  }

  private sanitizeFileName(fileName: string): string {
    const withoutDiacritics = fileName.normalize('NFD').replace(/\p{Diacritic}/gu, '');

    const withoutSpaces = withoutDiacritics.replace(/\s+/g, '_');

    const sanitized = withoutSpaces.replace(/[^a-zA-Z0-9_\-.]/g, '');

    return sanitized;
  }

  async getFileUrl(fileName: string) {
    if (!fileName) return null;

    return this.client.presign(fileName, {
      acl: 'public-read',
    });
  }
}
