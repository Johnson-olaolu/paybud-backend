import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FacebookAuthService {
  constructor(private readonly httpService: HttpService) {}

  async verifyToken(token: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get('me', {
          params: {
            access_token: token,
            fields: 'id,name,email',
          },
        }),
      );
      return response.data as {
        id: string;
        name: string;
        email: string;
        picture?: { data: { url: string } };
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid Facebook token');
    }
  }
}
