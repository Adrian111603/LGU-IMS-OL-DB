import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BarangayDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

