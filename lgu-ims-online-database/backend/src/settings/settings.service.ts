import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  async update(settings: Record<string, string>) {
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        this.prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
    return this.getAll();
  }
}

