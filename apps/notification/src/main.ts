import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RabbitmqService } from '@app/rabbitmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<NotificationModule>>(
      NotificationModule,
    );
  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice(
    rabbitmqService.getOptions(RABBITMQ_QUEUES.NOTIFICATION, true),
  );
  await app.init();
  await app.startAllMicroservices();
}
bootstrap();
