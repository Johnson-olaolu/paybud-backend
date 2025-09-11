/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientLocalAuthGuard } from '../../guards/loginGuard.guard';
import { Request } from 'express';
import { EmailLoginDto } from './dto/email-login.dto';
import { ClientUser } from 'apps/gateway/types/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Client Auth')
@Controller('client/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('email-token')
  getEmailToken(@Query('email') email: string) {
    this.authService.sendGetTokenEmail(email);
    return {
      success: true,
      message: 'A token has been sent to your email address',
    };
  }

  @HttpCode(200)
  @UseGuards(ClientLocalAuthGuard)
  @Post('email-login')
  async loginWithEmail(
    @Req() request: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: EmailLoginDto,
  ) {
    const user = (request as any).user as ClientUser;
    const token = await this.authService.getToken(user.id, user.email);
    return {
      success: true,
      message: 'user logged in successfully',
      data: {
        accessToken: token,
        user,
      },
    };
  }
}
