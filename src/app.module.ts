import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { SupabaseService } from './supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { JobModule } from './job/job.module';
import { QueueModule } from './queue/queue.module';
import { ResultModule } from './result/result.module';
import { RagieModule } from './ragie/ragie.module';
import { PdfModule } from './pdf/pdf.module';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UploadModule,
    SupabaseModule,
    JobModule,
    QueueModule,
    ResultModule,
    RagieModule,
    PdfModule,
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
