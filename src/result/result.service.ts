import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class ResultService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getResultByJobId(jobId: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch result: ${error.message}`,
      );
    }

    return data;
  }
}
