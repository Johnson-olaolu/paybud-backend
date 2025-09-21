import { NestFactory } from '@nestjs/core';
import { FileModule } from './file.module';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { RabbitmqService } from '@app/rabbitmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RpcExceptionWrapper } from '@app/shared/utils/exeption-wrapper';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<FileModule>>(FileModule);
  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  const microservice = await NestFactory.createMicroservice(FileModule, {
    ...rabbitmqService.getOptions(RABBITMQ_QUEUES.FILE, true),
  });
  microservice.useGlobalPipes(new ValidationPipe());
  microservice.useGlobalFilters(new RpcExceptionWrapper());
  await microservice.listen();
}
bootstrap();
