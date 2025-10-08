import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import pdfParse from 'pdf-parse';

@Injectable()
export class PdfService {
  async parsePdfFromUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const pdfBuffer = Buffer.from(response.data);

      const parsed = await pdfParse(pdfBuffer);

      const text = parsed.text.trim();

      if (!text) {
        throw new InternalServerErrorException('No text found in PDF');
      }

      return text;
    } catch {
      throw new InternalServerErrorException('Failed to parse PDF from URL');
    }
  }
}
