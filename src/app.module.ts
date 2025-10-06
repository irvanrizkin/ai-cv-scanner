import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { SupabaseService } from './supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [ConfigModule.forRoot(), UploadModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
