import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BarangaysService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.barangay.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
  }

  create(data: { name: string; code?: string; district?: string; active?: boolean }) {
    return this.prisma.barangay.create({ data });
  }

  update(id: string, data: { name?: string; code?: string; district?: string; active?: boolean }) {
    return this.prisma.barangay.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.barangay.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  }
}

