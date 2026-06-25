import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { existsSync } from 'fs';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatusDto } from './dto/status.dto';
import { UploadPackageDto } from './dto/upload-package.dto';
import { PackagesService } from './packages.service';

@UseGuards(JwtAuthGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Get()
  list(@CurrentUser() user: CurrentUser, @Query() query: any) {
    return this.packages.list(user, query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  upload(@CurrentUser() user: CurrentUser, @UploadedFile() file: Express.Multer.File, @Body() dto: UploadPackageDto) {
    return this.packages.upload(user, file, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.packages.get(user, id);
  }

  @Get(':id/download')
  async download(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Res() res: Response) {
    const pkg = await this.packages.markDownloaded(user, id);
    if (!existsSync(pkg.fileAsset.storagePath)) return res.status(404).json({ message: 'Stored file is missing' });
    return res.download(pkg.fileAsset.storagePath, pkg.fileAsset.originalName);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: CurrentUser, @Param('id') id: string, @Body() dto: StatusDto) {
    return this.packages.updateStatus(user, id, dto.status, dto.message);
  }

  @Delete(':id')
  archive(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.packages.archive(user, id);
  }
}
