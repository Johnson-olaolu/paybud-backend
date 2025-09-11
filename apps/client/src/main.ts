import { NestFactory } from '@nestjs/core';
import { ClientModule } from './client.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RabbitmqService } from '@app/rabbitmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { RpcExceptionWrapper } from '@app/shared/utils/exeption-wrapper';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<ClientModule>>(ClientModule);
  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  const microservice = await NestFactory.createMicroservice(ClientModule, {
    ...rabbitmqService.getOptions(RABBITMQ_QUEUES.CLIENT, true),
  });
  microservice.useGlobalPipes(new ValidationPipe());
  microservice.useGlobalFilters(new RpcExceptionWrapper());
  await microservice.listen();
}
bootstrap();
