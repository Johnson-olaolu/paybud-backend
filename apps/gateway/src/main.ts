import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './config/swaggar.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env.config';
import { RpcExceptionFilter } from './utils/rpc.exception';
import { configureBullMQ } from './config/bullmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
  });
  await configureSwagger(app, 'documentation');
  configureBullMQ(app, '/queues');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen(app.get(ConfigService).get('PORT') ?? 3000, '0.0.0.0', () =>
    new Logger('Documentation').log(
      `http://localhost:${app.get(ConfigService<EnvironmentVariables>).get('PORT')}/documentation`,
    ),
  );
}
bootstrap();
