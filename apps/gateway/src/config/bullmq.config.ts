import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { Queue, QueueOptions } from 'bullmq';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { INestApplication } from '@nestjs/common';
import basicAuth from 'express-basic-auth';
import { APP_JOB_NAMES } from '@app/shared/utils/constants';

export const configureBullMQ = (app: INestApplication, path: string) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(path);

  app.use(
    path,
    basicAuth({
      users: {
        [process.env.BULL_ADMIN_USER as string]: process.env
          .BULL_ADMIN_PASSWORD as string,
      },
      challenge: true,
    }),
  );

  const config: QueueOptions = {
    connection: {
      host: 'localhost',
      port: 6379,
      // username: process.env.REDIS_USERNAME,
      // password: process.env.REDIS_PASSWORD,
    },
  };

  //   const emailQueue = new Queue('EMAIL_JOB', config);

  createBullBoard({
    queues: [
      ...Object.keys(APP_JOB_NAMES).map(
        (jobName) =>
          new BullMQAdapter(new Queue(APP_JOB_NAMES[jobName], config)),
      ),
    ],
    serverAdapter,
  });
  app.use(path, serverAdapter.getRouter());
};
