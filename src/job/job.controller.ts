import { Body, Controller, Post } from '@nestjs/common';
import { JobService } from './job.service';
import { InsertJobDto } from './dto/insert-job.dto';

@Controller('evaluate')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async createJob(@Body() insertJobDto: InsertJobDto) {
    const {
      cv_id: cvId,
      project_report_id: projectReportId,
      job_title: jobTitle,
    } = insertJobDto;

    const result = await this.jobService.insertJob({
      cvId,
      projectReportId,
      jobTitle,
    });

    return {
      id: result.id,
      status: result.status,
    };
  }
}
