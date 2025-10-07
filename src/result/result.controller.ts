import { Controller, Get, Param } from '@nestjs/common';
import { ResultService } from './result.service';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get('/:id')
  async getResultByJobId(@Param('id') id: string) {
    const result = await this.resultService.getResultByJobId(parseInt(id, 10));

    if (result.status === 'completed') {
      return {
        id: result.id,
        status: result.status,
        result: {
          cv_match_rate: result.cv_match_rate,
          cv_feedback: result.cv_feedback,
          project_score: result.project_score,
          project_feedback: result.project_feedback,
          overall_summary: result.overall_summary,
        },
      };
    }

    return { id: result.id, status: result.status };
  }
}
