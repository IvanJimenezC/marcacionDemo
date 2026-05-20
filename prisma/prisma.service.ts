import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Se ejecuta al levantar la aplicación de NestJS
  async onModuleInit() {
    await this.$connect();
  }

  // Se ejecuta al apagar la aplicación de NestJS de forma limpia
  async onModuleDestroy() {
    await this.$disconnect();
  }
}