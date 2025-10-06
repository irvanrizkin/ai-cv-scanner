import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'database.types';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient<Database> = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  getClient() {
    return this.supabase;
  }
}
