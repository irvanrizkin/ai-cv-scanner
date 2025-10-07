import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SupabaseService } from 'src/supabase/supabase.service';

interface JobData {
  jobId: number;
  cvId: number | null;
  projectReportId: number | null;
}

@Processor('cv-processing')
export class QueueProcessor extends WorkerHost {
  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async process(job: Job<JobData>) {
    const supabase = this.supabaseService.getClient();

    await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', job.data.jobId);

    return Promise.resolve();
  }
}
