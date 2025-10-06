import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { v4 as uuid } from 'uuid';

export interface UploadedResult {
  path: string;
  publicUrl: string;
}

@Injectable()
export class UploadService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Upload single file safely to Supabase
   */
  private async uploadSingleFile(
    bucket: string,
    file: Express.Multer.File,
    folder: string,
  ): Promise<number> {
    const supabase = this.supabaseService.getClient();

    const originalName = file?.originalname ?? 'file';
    const ext = originalName.includes('.')
      ? originalName.split('.').pop()
      : 'bin';
    const safeExt = ext ?? 'bin';
    const fileName = `${uuid()}.${safeExt}`;
    const path = `${folder}/${fileName}`;

    const buffer = file?.buffer;
    if (!buffer) {
      throw new Error('File buffer is missing.');
    }

    const mimetype = file?.mimetype ?? 'application/octet-stream';

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: mimetype });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    const { data, error: insertError } = await supabase
      .from('documents')
      .insert({
        public_url: publicUrlData.publicUrl,
        category: folder,
      })
      .select();

    if (insertError) {
      throw new Error(
        `Failed to insert document record: ${insertError.message}`,
      );
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to insert document record.');
    }

    return data[0].id;
  }

  /**
   * Upload two files: CV and Project Report
   */
  async uploadFiles(
    bucket: string,
    files: { cv?: Express.Multer.File; project_report?: Express.Multer.File },
  ) {
    const cvId = files.cv
      ? await this.uploadSingleFile(bucket, files.cv, 'cv')
      : null;
    const projectReportId = files.project_report
      ? await this.uploadSingleFile(
          bucket,
          files.project_report,
          'project_report',
        )
      : null;

    return {
      cvId,
      projectReportId,
    };
  }
}
