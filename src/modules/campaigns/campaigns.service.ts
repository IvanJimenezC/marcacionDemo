import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateCampaignDto) {

    this.validarFechasCampania(dto.start_date, dto.end_date);

    return await this.prisma.campaigns.create({
      data: {
        name: dto.name,
        skill_id: dto.skill_id || null,
        overflow_id: dto.overflow_id || null,
        status: dto.status || 'draft',
        campaign_timezone: dto.campaign_timezone || 'America/Mexico_City',
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        start_time: new Date(`1970-01-01T${dto.start_time}:00Z`),
        end_time: new Date(`1970-01-01T${dto.end_time}:00Z`),
        max_attempts: dto.max_attempts ?? 3,
        wait_time_seconds: dto.wait_time_seconds ?? 3600,
      },
    });
  }

  async update(id: string, dto: CreateCampaignDto) {

    const campaign = await this.prisma.campaigns.findFirst({
      where: { id, deleted_at: null },
    });
    if (!campaign) throw new NotFoundException('La campaña no disponible.');

    this.validarFechasCampania(dto.start_date, dto.end_date);


    return await this.prisma.campaigns.update({
      where: { id },
      data: {
        name: dto.name,
        skill_id: dto.skill_id || null,
        overflow_id: dto.overflow_id || null,
        status: dto.status,
        campaign_timezone: dto.campaign_timezone,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        start_time: new Date(`1970-01-01T${dto.start_time}:00Z`),
        end_time: new Date(`1970-01-01T${dto.end_time}:00Z`),
        max_attempts: Number(dto.max_attempts),
        wait_time_seconds: Number(dto.wait_time_seconds),
      },
    });
  }

  async findAll() {

    return await this.prisma.campaigns.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async remove(id: string) {

    const campaign = await this.prisma.campaigns.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('La campaña no existe.');

    // SoftDelete...
    return await this.prisma.campaigns.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  private validarFechasCampania(startDateStr: string, endDateStr?: string | null): void {
    // Obtener la fecha actual del sistema a medianoche 
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Parsear y limpiar la fecha de inicio
    const fechaInicio = new Date(startDateStr);
    fechaInicio.setHours(0, 0, 0, 0);

    // No programar en el pasado
    if (fechaInicio < hoy) {
      throw new BadRequestException(
        'No se puede registrar una campaña con una fecha de inicio en el pasado.'
      );
    }


    if (endDateStr) {
      const fechaFin = new Date(endDateStr);
      fechaFin.setHours(0, 0, 0, 0);

      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin no puede ser anterior a la fecha de inicio.'
        );
      }
    }
  }
}