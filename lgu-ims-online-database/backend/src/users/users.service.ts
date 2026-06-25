import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      omit: { passwordHash: true },
      include: { assignedBarangay: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: CreateUserDto) {
    if (data.role === UserRole.BARANGAY_USER && !data.assignedBarangayId) {
      throw new BadRequestException('Barangay users must be assigned to a barangay');
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
        role: data.role,
        ...(data.assignedBarangayId ? { assignedBarangay: { connect: { id: data.assignedBarangayId } } } : {})
      },
      omit: { passwordHash: true }
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : undefined;
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(data.assignedBarangayId ? { assignedBarangay: { connect: { id: data.assignedBarangayId } } } : {}),
        ...(passwordHash ? { passwordHash } : {})
      },
      omit: { passwordHash: true }
    });
  }

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      omit: { passwordHash: true }
    });
  }
}
