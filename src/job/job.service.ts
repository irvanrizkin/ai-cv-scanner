import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class JobService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async insertJob(params: {
    cvId: string;
    projectReportId: string;
    jobTitle: string;
  }) {
    const supabase = this.supabaseService.getClient();

    const { cvId, projectReportId, jobTitle } = params;

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        cv_id: cvId ? parseInt(cvId, 10) : null,
        project_report_id: projectReportId
          ? parseInt(projectReportId, 10)
          : null,
        job_title: jobTitle,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert job record: ${error.message}`);
    }

    return data;
  }
}
