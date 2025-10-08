import { Injectable } from '@nestjs/common';
import { Ragie } from 'ragie';

@Injectable()
export class RagieService {
  async retrieve(query: string, scope: string) {
    try {
      const ragie = new Ragie({
        auth: process.env.RAGIE_KEY || '',
      });

      const result = await ragie.retrievals.retrieve({
        query,
        filter: { scope },
      });

      const text =
        result.scoredChunks
          ?.map((chunk) => chunk.text)
          .join('\n\n')
          .trim() || '';

      return text;
    } catch (error) {
      throw new Error(`Failed to retrieve data: ${error}`);
    }
  }
}
