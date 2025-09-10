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

  @IsNumber()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_KEY: string;

  @IsNumber()
  JWT_ACCESS_TOKEN_EXPIRATION: number;

  @IsNumber()
  JWT_REFRESH_TOKEN_EXPIRATION: number;

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
