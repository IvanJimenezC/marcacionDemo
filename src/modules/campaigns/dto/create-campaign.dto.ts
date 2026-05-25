import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  skill_id?: string;

  @IsUUID()
  @IsOptional()
  overflow_id?: string;

  @IsString()
  @IsOptional()
  status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'stopped' | 'completed';

  @IsString()
  @IsOptional()
  campaign_timezone?: string;

  @IsString()
  @IsNotEmpty() // Mapea a DATE (se recibe como string ISO o 'YYYY-MM-DD')
  start_date: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsNotEmpty() // Mapea a TIME (ej: '08:00')
  start_time: string;

  @IsString()
  @IsNotEmpty() // Mapea a TIME (ej: '18:00')
  end_time: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  max_attempts?: number;

  @IsInt()
  @Min(60)
  @IsOptional()
  wait_time_seconds?: number;
}