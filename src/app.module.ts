import { Module } from '@nestjs/common';
import { DemoModule } from './modules/demo/demo.module';
import { ImportModule } from './modules/import/import.module';

@Module({
  imports: [DemoModule, ImportModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
