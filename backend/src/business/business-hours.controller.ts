import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { BusinessHourDto } from './dto/business-hour.dto.js';
import { BusinessHoursService } from './business-hours.service.js';

class ReplaceHoursDto { @ValidateNested({ each: true }) @Type(() => BusinessHourDto) hours!: BusinessHourDto[]; }
class ClosureDto { @IsDateString() date!: string; @IsOptional() @IsString() reason?: string; }
interface AuthRequest extends Request { user: { id: string } }

@Controller('businesses')
export class BusinessHoursController {
  constructor(private readonly service: BusinessHoursService) {}
  @Get(':id/hours') list(@Param('id') id: string) { return this.service.list(id); }
  @Put(':id/hours') @UseGuards(JwtAuthGuard) replace(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: ReplaceHoursDto) { return this.service.replace(req.user.id, id, dto.hours); }
  @Put(':id/closures') @UseGuards(JwtAuthGuard) closure(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: ClosureDto) { return this.service.addClosure(req.user.id, id, dto.date, dto.reason); }
}
