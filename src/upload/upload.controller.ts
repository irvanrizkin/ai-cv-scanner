import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cv', maxCount: 1 },
      { name: 'project_report', maxCount: 1 },
    ]),
  )
  async uploadMultiple(
    @UploadedFiles()
    files: {
      cv?: Express.Multer.File[];
      project_report?: Express.Multer.File[];
    },
  ) {
    const cv = files.cv?.[0];
    const projectReport = files.project_report?.[0];

    if (!cv && !projectReport) {
      throw new Error('No files uploaded. Please upload at least one file.');
    }

    const { cvId, projectReportId } = await this.uploadService.uploadFiles(
      'documents',
      {
        cv,
        project_report: projectReport,
      },
    );

    return {
      cv_id: cvId?.toString(),
      project_report_id: projectReportId?.toString(),
    };
  }
}
