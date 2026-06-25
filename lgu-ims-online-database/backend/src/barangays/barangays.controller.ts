import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BarangayDto } from './dto/barangay.dto';
import { BarangaysService } from './barangays.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('barangays')
export class BarangaysController {
  constructor(private readonly barangays: BarangaysService) {}

  @Get()
  list() {
    return this.barangays.list();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: BarangayDto) {
    return this.barangays.create(dto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<BarangayDto>) {
    return this.barangays.update(id, dto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barangays.remove(id);
  }
}
