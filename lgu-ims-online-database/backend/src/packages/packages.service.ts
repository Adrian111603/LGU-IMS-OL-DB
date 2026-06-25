import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ModuleType, PackageDirection, PackageStatus, UserRole } from '@prisma/client';
import { extname } from 'path';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { allowedPackageExtensions, editablePackageStatuses } from './package-rules';

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  visibilityWhere(user: CurrentUser) {
    if (user.role !== UserRole.BARANGAY_USER) return { deletedAt: null };
    return {
      deletedAt: null,
      OR: [{ sourceBarangayId: user.assignedBarangayId }, { targetBarangayId: user.assignedBarangayId }]
    };
  }

  list(user: CurrentUser, query: { barangayId?: string; moduleType?: ModuleType; status?: PackageStatus }) {
    return this.prisma.onlineExchangePackage.findMany({
      where: {
        AND: [
          this.visibilityWhere(user),
          ...(query.moduleType ? [{ moduleType: query.moduleType }] : []),
          ...(query.status ? [{ status: query.status }] : []),
          ...(query.barangayId
            ? [{ OR: [{ sourceBarangayId: query.barangayId }, { targetBarangayId: query.barangayId }] }]
            : [])
        ]
      },
      include: { sourceBarangay: true, targetBarangay: true, fileAsset: true, uploadedBy: { omit: { passwordHash: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async get(user: CurrentUser, id: string) {
    const pkg = await this.prisma.onlineExchangePackage.findFirst({
      where: { id, ...this.visibilityWhere(user) },
      include: {
        sourceBarangay: true,
        targetBarangay: true,
        fileAsset: true,
        uploadedBy: { omit: { passwordHash: true } },
        logs: { include: { createdBy: { omit: { passwordHash: true } } }, orderBy: { createdAt: 'desc' } }
      }
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async upload(user: CurrentUser, file: Express.Multer.File, input: {
    direction?: PackageDirection;
    moduleType: ModuleType;
    title: string;
    sourceBarangayId?: string;
    targetBarangayId?: string;
    notes?: string;
  }) {
    if (!file) throw new BadRequestException('File is required');
    const extension = extname(file.originalname).toLowerCase();
    if (!allowedPackageExtensions.has(extension)) throw new BadRequestException('File type is not allowed');

    let direction = input.direction;
    let sourceBarangayId = input.sourceBarangayId;
    let targetBarangayId = input.targetBarangayId;

    if (user.role === UserRole.BARANGAY_USER) {
      direction = PackageDirection.BARANGAY_TO_MUNICIPAL;
      sourceBarangayId = user.assignedBarangayId ?? undefined;
      targetBarangayId = undefined;
      if (!sourceBarangayId) throw new ForbiddenException('Barangay user has no assigned barangay');
    }

    if (user.role === UserRole.MUNICIPAL_ADMIN) {
      direction = PackageDirection.MUNICIPAL_TO_BARANGAY;
      sourceBarangayId = undefined;
    }

    if (!direction) throw new BadRequestException('Direction is required');
    if (direction === PackageDirection.MUNICIPAL_TO_BARANGAY && !targetBarangayId) {
      throw new BadRequestException('Target barangay is required');
    }

    const saved = await this.storage.save(file);
    const asset = await this.prisma.fileAsset.create({
      data: {
        originalName: file.originalname,
        storedName: saved.storedName,
        mimeType: file.mimetype,
        extension: extension.replace('.', ''),
        sizeBytes: BigInt(file.size),
        storagePath: saved.storagePath,
        checksum: saved.checksum,
        uploadedById: user.id
      }
    });

    const pkg = await this.prisma.onlineExchangePackage.create({
      data: {
        direction,
        moduleType: input.moduleType,
        title: input.title,
        sourceBarangayId,
        targetBarangayId,
        notes: input.notes,
        fileAssetId: asset.id,
        uploadedById: user.id,
        logs: { create: { status: 'UPLOADED', message: 'Package uploaded', createdById: user.id } }
      },
      include: { fileAsset: true, sourceBarangay: true, targetBarangay: true }
    });
    return pkg;
  }

  async markDownloaded(user: CurrentUser, id: string) {
    await this.get(user, id);
    return this.prisma.onlineExchangePackage.update({
      where: { id },
      data: {
        status: 'DOWNLOADED',
        downloadedAt: new Date(),
        logs: { create: { status: 'DOWNLOADED', message: 'Package downloaded', createdById: user.id } }
      },
      include: { fileAsset: true }
    });
  }

  async updateStatus(user: CurrentUser, id: string, status: PackageStatus, message?: string) {
    if (user.role === UserRole.BARANGAY_USER) throw new ForbiddenException();
    if (!editablePackageStatuses.has(status)) throw new BadRequestException('Status is not allowed');
    await this.get(user, id);
    return this.prisma.onlineExchangePackage.update({
      where: { id },
      data: {
        status,
        reviewedAt: ['REVIEWING', 'REJECTED', 'NEEDS_CORRECTION'].includes(status) ? new Date() : undefined,
        importedAt: status === 'IMPORTED' ? new Date() : undefined,
        deletedAt: status === 'ARCHIVED' ? new Date() : undefined,
        logs: { create: { status, message, createdById: user.id } }
      }
    });
  }

  archive(user: CurrentUser, id: string) {
    return this.updateStatus(user, id, 'ARCHIVED', 'Package archived');
  }
}
