/* eslint-disable @typescript-eslint/no-unused-vars */
import { plainToInstance } from 'class-transformer';
import {
  // IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

// export enum Environment {
//   Development = 'development',
//   Production = 'production',
//   Test = 'test',
//   Provision = 'provision',
// }

export class EnvironmentVariables {
  // @IsEnum(Environment, {
  //   message:
  //     'NODE_ENV must be one of: development, production, test, provision',
  // })
  // NODE_ENV: Environment;
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  // @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_URL: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_VENDOR_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_CLIENT_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_NOTIFICATION_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_ORDER_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_FILE_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  RABBITMQ_PAYMENT_QUEUE: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  REDIS_HOST: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  REDIS_USERNAME?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL: string;

  @IsString()
  @IsNotEmpty()
  PASSWORD_EXPIRATION_TIME: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    });
    throw new Error(
      `Environment validation failed:\n${errorMessages.join('\n')}`,
    );
  }
  return validatedConfig;
}
