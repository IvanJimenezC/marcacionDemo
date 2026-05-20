import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadCsvDto {
    @IsUUID()
    @IsNotEmpty()
    campaignId: string;

    // Mapeo dinámico enviado desde la interfaz
    @IsString()
    @IsNotEmpty()
    colNombre: string;

    @IsString()
    @IsNotEmpty()
    colTelefono: string;
}