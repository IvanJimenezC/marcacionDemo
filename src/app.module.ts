import { Module } from '@nestjs/common';
import { ImportModule } from './modules/import/import.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';

@Module({
  imports: [ImportModule, CampaignsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
