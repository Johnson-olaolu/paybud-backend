import { NestFactory } from '@nestjs/core';
import { VendorModule } from './vendor.module';
import { RabbitmqService } from '@app/rabbitmq';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';

async function bootstrap() {
  const app =
    await NestFactory.create<INestApplication<VendorModule>>(VendorModule);
  const rabbitmqService = app.get<RabbitmqService>(RabbitmqService);
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice(
    rabbitmqService.getOptions(RABBITMQ_QUEUES.VENDOR, true),
  );
  await app.init();
  await app.startAllMicroservices();
}
bootstrap();
