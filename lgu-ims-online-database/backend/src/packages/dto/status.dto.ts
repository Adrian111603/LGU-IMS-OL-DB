import { PackageStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class StatusDto {
  @IsEnum(PackageStatus)
  status: PackageStatus;

  @IsOptional()
  @IsString()
  message?: string;
}

