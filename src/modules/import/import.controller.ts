import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { UploadCsvDto } from './dto/upload-csv.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadCsvDto: UploadCsvDto,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo CSV es requerido.');
    }
    
    // TODO Validar que sea un CSV
    
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Formato de archivo inválido. Debe ser un CSV.');
    }

    return await this.importService.processCsv(file.buffer, uploadCsvDto);
  }

  // TODO Registrar campana
}