import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RABBITMQ_QUEUES } from './constants';
import { File } from '../types';

export function isBcryptHash(str: string) {
  const bcryptRegex = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/;
  return bcryptRegex.test(str);
}

export async function fetchFileById(fileId: string): Promise<File> {
  let client: ClientProxy | null = null;

  try {
    // Create RabbitMQ client connection
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: `RABBITMQ_${RABBITMQ_QUEUES.FILE}_QUEUE`, // This should match RABBITMQ_QUEUES.FILE from your constants
        queueOptions: {
          durable: true,
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    });

    // Connect to the microservice
    await client.connect();

    // Send message pattern to get file - this matches your @MessagePattern('getFile')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const fileData = await lastValueFrom(
      client.send<File>('getFile', fileId),
    ).catch((error) => {
      throw new RpcException(error);
    });

    return fileData;
  } catch (error) {
    console.error('Error fetching file:', error);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    throw new RpcException(error);
  } finally {
    // Clean up connection
    if (client) {
      await client.close();
    }
  }
}
