import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureSwagger } from './config/swaggar.config';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
  });
  await configureSwagger(app, 'documentation');
  await app.listen(app.get(ConfigService).get('PORT') ?? 3000, '0.0.0.0', () =>
    new Logger('Documentation').log(
      `http://localhost:${app.get(ConfigService<EnvironmentVariables>).get('PORT')}/documentation`,
    ),
  );
}
bootstrap();
