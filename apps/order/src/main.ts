import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { RabbitmqService } from '@app/rabbitmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { RpcExceptionWrapper } from '@app/shared/utils/exeption-wrapper';
import { INestApplication, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<OrderModule>>(OrderModule);
  app.useGlobalPipes(new ValidationPipe());

  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  const microservice = await NestFactory.createMicroservice(OrderModule, {
    ...rabbitmqService.getOptions(RABBITMQ_QUEUES.ORDER, true),
  });
  microservice.useGlobalPipes(new ValidationPipe());
  microservice.useGlobalFilters(new RpcExceptionWrapper());
  await microservice.listen();
}
bootstrap();
