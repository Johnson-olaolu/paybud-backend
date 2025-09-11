import { Module } from '@nestjs/common';
import { FacebookAuthService } from './facebook.auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      baseURL: `https://graph.facebook.com/`,
    }),
  ],
  providers: [FacebookAuthService],
  exports: [FacebookAuthService],
})
export class FacebookModule {}
