import { OAuth2Client } from 'google-auth-library';
import { EnvironmentVariables } from '../../config/env.config';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthService {
  oAuth2Client: OAuth2Client;
  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.oAuth2Client = new OAuth2Client({
      clientId: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      //   redirectUri: `${configService.get('FRONTEND_URL')}/auth/google/callback`, // Adjust as necessary
    });
  }

  async verifyToken(token: string) {
    const ticket = await this.oAuth2Client.verifyIdToken({
      idToken: token,
      audience: this.configService.get('GOOGLE_CLIENT_ID'), // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    return payload;
  }
}
