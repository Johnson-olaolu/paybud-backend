import { Global, Module } from '@nestjs/common';
import { GoogleAuthService } from './google/google-auth.service';
import { FacebookModule } from './facebook/facebook.module';

@Global()
@Module({
  imports: [FacebookModule],
  providers: [GoogleAuthService],
  exports: [GoogleAuthService, FacebookModule],
})
export class ServicesModule {}
