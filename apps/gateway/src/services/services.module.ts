import { Global, Module } from '@nestjs/common';
import { GoogleAuthService } from './google/google-auth.service';

@Global()
@Module({
  imports: [],
  providers: [GoogleAuthService],
  exports: [GoogleAuthService],
})
export class ServicesModule {}
