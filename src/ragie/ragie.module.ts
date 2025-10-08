import { Module } from '@nestjs/common';
import { RagieService } from './ragie.service';

@Module({
  providers: [RagieService],
  exports: [RagieService],
})
export class RagieModule {}
