import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('cv-processing') private readonly jobQueue: Queue) {}

  async addJob(data: any) {
    const job = await this.jobQueue.add('process-cv', data, {
      removeOnComplete: true,
      removeOnFail: false,
    });

    return job;
  }
}
