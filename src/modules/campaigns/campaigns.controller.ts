import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly prisma: PrismaService
  ) { }

  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return await this.campaignsService.create(createCampaignDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: CreateCampaignDto // Reutilizamos el DTO o usas un UpdateCampaignDto si lo tienes
  ) {
    return await this.campaignsService.update(id, updateCampaignDto);
  }

  @Get()
  async findAll() {
    return await this.campaignsService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.campaignsService.remove(id);
  }

  @Get('catalogs/skills')
  async getSkills() {
    return await this.prisma.skills.findMany({ where: { deleted_at: null } });
  }

  @Get('catalogs/overflows')
  async getOverflows() {
    return await this.prisma.overflows.findMany({ where: { deleted_at: null } });
  }
}