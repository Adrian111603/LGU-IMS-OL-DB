import { ModuleType, PackageDirection } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadPackageDto {
  @IsOptional()
  @IsEnum(PackageDirection)
  direction?: PackageDirection;

  @IsEnum(ModuleType)
  moduleType: ModuleType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  sourceBarangayId?: string;

  @IsOptional()
  @IsString()
  targetBarangayId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

