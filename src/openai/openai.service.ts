import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateText(instruction: string, input: string) {
    const response = await this.openAI.responses.create({
      model: 'gpt-5-nano',
      instructions: instruction,
      input: input,
    });

    return response.output_text;
  }
}
