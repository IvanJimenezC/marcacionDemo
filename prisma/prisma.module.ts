import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hace que el módulo sea global en toda la aplicación
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Lo exportamos para que otros servicios lo inyecten
})
export class PrismaModule {}