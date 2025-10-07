/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNumberString, IsString } from 'class-validator';

export class InsertJobDto {
  @IsString()
  job_title: string;

  @IsNumberString()
  cv_id: string;

  @IsNumberString()
  project_report_id: string;
}
