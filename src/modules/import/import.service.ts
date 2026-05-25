import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UploadCsvDto } from './dto/upload-csv.dto';
import { parse } from 'csv-parse/sync';


@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) { }

  private cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+52')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('52') && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    }
    return cleaned;
  }

  async processCsv(fileBuffer: Buffer, dto: UploadCsvDto) {
    // TODO Validar campaña
    const campaign = await this.prisma.campaigns.findFirst({
      where: { id: dto.campaignId, deleted_at: null },
    });

    if (!campaign) {
      throw new BadRequestException('La campaña especificada no existe o fue eliminada.');
    }

    // TODO Parsear CSV original
    let records: any[];
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw new BadRequestException('Error al procesar el formato del archivo CSV.');
    }

    if (records.length === 0) {
      throw new BadRequestException('El archivo CSV está vacío.');
    }

    let creados = 0;
    let duplicados = 0;
    let omitidos = 0;

    // TODO Aquí acumularemos los registros rechazados con su respectivo error HDP
    const registrosRechazados: any[] = [];

    // Trans e Inserción
    await this.prisma.$transaction(async (tx) => {
      for (const [index, row] of records.entries()) {
        const rawPhone = row[dto.colTelefono];
        const rawName = row[dto.colNombre];

        // Validar Campos obligatorios vacíos
        if (!rawPhone || !rawName) {
          omitidos++;
          registrosRechazados.push({
            ...row,
            motivo_rechazo: 'Nombre o Teléfono ausente en la fila',
          });
          continue;
        }

        const cleanPhone = this.cleanPhoneNumber(rawPhone);

        //TODO validar Longitud errónea (numeros que no sean de 10 digitos >.<)
        if (cleanPhone.length < 10) {
          omitidos++;
          registrosRechazados.push({
            ...row,
            motivo_rechazo: `Teléfono inválido (${cleanPhone.length} dígitos tras limpieza)`,
          });
          continue;
        }

        if (cleanPhone.length > 10) {
          omitidos++;
          registrosRechazados.push({
            ...row,
            motivo_rechazo: 'Teléfono excede los 10 dígitos reglamentarios',
          });
          continue;
        }

        // Duplicados en la campaña 
        const existingLead = await tx.campaignLeads.findUnique({
          where: {
            campaign_id_phone_number: {
              campaign_id: dto.campaignId,
              phone_number: cleanPhone,
            },
          },
        });

        if (existingLead) {
          duplicados++;
          registrosRechazados.push({
            ...row,
            motivo_rechazo: 'Número telefónico duplicado en esta campaña',
          });
          continue;
        }

        // Revisa validaciones...
        const additionalData = { ...row };
        delete additionalData[dto.colTelefono];
        delete additionalData[dto.colNombre];

        const profile = await tx.leadProfiles.create({
          data: {
            full_name: rawName,
            additional_data: additionalData as any,
          },
        });

        await tx.campaignLeads.create({
          data: {
            campaign_id: dto.campaignId,
            lead_profile_id: profile.id,
            phone_number: cleanPhone,
            call_status: 'pending',
            current_attempts: 0,
          },
        });

        creados++;
      }
    });

    // TODO Generar el CSV de errores si es que existen rechazos
    
    const csvErroresBase64 = registrosRechazados.length > 0
      ? this.generateBase64Csv(registrosRechazados)
      : null;


    return {
      message: 'Procesamiento de archivo CSV finalizado.',
      summary: {
        totalRowsProcessed: records.length,
        insertedLeads: creados,
        duplicateLeads: duplicados,
        malformedOrOmittedLeads: omitidos,
      },
      // Le enviamos al front el archivo listo para descargar si hubo fallas
      errorsFile: csvErroresBase64 ? `data:text/csv;base64,${csvErroresBase64}` : null,
    };
  }

  // TODO Función auxiliar para convertir el JSON de errores a un string CSV en Base64
  private generateBase64Csv(data: any[]): string {
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')]; // Primera fila: Cabeceras

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] ? row[header].toString() : '';
        
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    return Buffer.from(csvString, 'utf-8').toString('base64');
  }
}