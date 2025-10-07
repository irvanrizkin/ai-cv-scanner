import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [SupabaseModule, QueueModule],
  providers: [JobService],
  controllers: [JobController],
})
export class JobModule {}
