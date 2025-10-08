import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OpenaiService } from 'src/openai/openai.service';
import { PdfService } from 'src/pdf/pdf.service';
import { RagieService } from 'src/ragie/ragie.service';
import { SupabaseService } from 'src/supabase/supabase.service';

interface JobData {
  jobId: number;
  cvId: number | null;
  projectReportId: number | null;
}

interface OverallEvaluation {
  cv_match_rate: number;
  cv_feedback: string;
  project_score: number;
  project_feedback: string;
  overall_summary: string;
}

@Processor('cv-processing')
export class QueueProcessor extends WorkerHost {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly ragieService: RagieService,
    private readonly pdfService: PdfService,
    private readonly openaiService: OpenaiService,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    const supabase = this.supabaseService.getClient();

    await supabase
      .from('jobs')
      .update({
        status: 'processing',
      })
      .eq('id', job.data.jobId);

    try {
      // STEP 1 : CV Evaluation
      const { data: cvPdfData } = await supabase
        .from('documents')
        .select('public_url')
        .eq('id', job.data.cvId ?? 0)
        .single();

      if (!cvPdfData?.public_url) {
        throw new Error('CV PDF not found');
      }

      const cvText = await this.pdfService.parsePdfFromUrl(
        cvPdfData.public_url,
      );

      const aboutJob = await this.ragieService.retrieve(
        'About Job',
        'about-job',
      );
      const aboutYou = await this.ragieService.retrieve(
        'About You',
        'about-you',
      );
      const scoringCv = await this.ragieService.retrieve(
        'Scoring CV',
        'scoring-cv',
      );

      const cvEvaluationPrompt = `
      You are an expert HR recruiter. Evaluate the following CV based on the context provided.

      # Context
      Job Description:
      ${aboutJob}

      Candidate Background:
      ${aboutYou}

      Scoring Criteria:
      ${scoringCv}

      You must provide
      - CV Match Rate (0-1)
      - Brief CV Feedback
      in JSON format like this only for parsing purpose:
      {
        "cv_match_rate": 0.8,
        "cv_feedback": "The candidate has relevant experience but lacks specific skills in..."
      }
      `;

      const cvEvaluationResult = await this.openaiService.generateText(
        cvEvaluationPrompt,
        cvText,
      );

      // STEP 2 : Project Evaluation
      const { data: projectReportData } = await supabase
        .from('documents')
        .select('public_url')
        .eq('id', job.data.projectReportId ?? 0)
        .single();

      if (!projectReportData?.public_url) {
        throw new Error('Project Report PDF not found');
      }

      const projectReportText = await this.pdfService.parsePdfFromUrl(
        projectReportData.public_url,
      );

      const caseStudy = await this.ragieService.retrieve(
        'Case Study',
        'case-study',
      );
      const scoringProject = await this.ragieService.retrieve(
        'Scoring Project',
        'scoring-project',
      );

      const projectEvaluationPrompt = `
      You are an expert HR recruiter. Evaluate the following Project Report based on the context provided.

      # Context
      Case Study:
      ${caseStudy}

      Scoring Criteria:
      ${scoringProject}

      You must provide
      - Project Match Rate (1-5)
      - Brief Project Feedback
      in JSON format like this only for parsing purpose:
      {
        "project_score": 4,
        "project_feedback": "The project demonstrates strong problem-solving skills but lacks depth in..."
      }
      `;

      const projectEvaluationResult = await this.openaiService.generateText(
        projectEvaluationPrompt,
        projectReportText,
      );

      // STEP 3 : Overall Evaluation
      const overallEvaluationPrompt = `
      You are an expert HR recruiter. Based on the CV evaluation and Project Report evaluation provided, give an overall recommendation.

      You must provide
      - cv_match_rate (0-1) from CV evaluation
      - cv_feedback (3-5 sentences) from CV evaluation
      - project_score (1-5) from Project evaluation
      - project_feedback (3-5 sentences) from Project evaluation
      - Brief Overall Summary (3-5 sentences containing strengths, weaknesses, and recommendation)
      in JSON format like this only for parsing purpose:
      {
        "cv_match_rate": 0.8,
        "cv_feedback": "The candidate has relevant experience but lacks specific skills in...",
        "project_score": 4,
        "project_feedback": "The project demonstrates strong problem-solving skills but lacks depth in...",
        "overall_summary": "The candidate shows strong potential with relevant experience in... However, there are gaps in... Overall, I recommend..."
      }
      `;

      const overallEvaluationResult = await this.openaiService.generateText(
        overallEvaluationPrompt,
        `CV Evaluation: ${cvEvaluationResult}\nProject Report Evaluation: ${projectEvaluationResult}`,
      );

      const rawOverallEvaluation = overallEvaluationResult
        .replace(/```json|```/g, '')
        .trim();

      const overallEvaluation = JSON.parse(
        rawOverallEvaluation,
      ) as OverallEvaluation;

      const { error } = await supabase
        .from('jobs')
        .update({
          cv_match_rate: overallEvaluation.cv_match_rate,
          cv_feedback: overallEvaluation.cv_feedback,
          project_score: overallEvaluation.project_score,
          project_feedback: overallEvaluation.project_feedback,
          overall_summary: overallEvaluation.overall_summary,
          status: 'completed',
        })
        .eq('id', job.data.jobId);

      if (error) {
        console.error('Error updating job with evaluation results:', error);
        throw new Error('Failed to update job with evaluation results');
      }
    } catch (error) {
      console.error('Error parsing overall evaluation JSON:', error);
    }

    return Promise.resolve();
  }
}
