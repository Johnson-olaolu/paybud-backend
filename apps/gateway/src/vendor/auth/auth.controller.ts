/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  Res,
  Param,
  Get,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { VendorLocalAuthGuard } from '../../guards/loginGuard.guard';
import { LoginDto } from './dto/login.dto';
import { User } from 'apps/gateway/types/vendor';
import { Response, Request } from 'express';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';

@ApiTags('Vendor Auth')
@Controller('vendor/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);
    return {
      sucess: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      data,
    };
  }

  @HttpCode(200)
  @UseGuards(VendorLocalAuthGuard)
  @Post('login')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loginUser(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ) {
    const user = (request as any).user as User;
    const tokens = await this.authService.getTokens(user.id, user.email);
    res.setHeader('x-refresh-token', tokens.refreshToken);
    return {
      success: true,
      message: 'user logged in successfully',
      data: {
        accessToken: tokens.accessToken,
        user,
      },
    };
  }

  @Post('google-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const user = await this.authService.googleLogin(googleLoginDto);
    return {
      success: true,
      message: 'Google login successful',
      data: user,
    };
  }

  @Post('facebook-login')
  async facebookLogin(@Body() facebookLoginDto: FacebookLoginDto) {
    const user = await this.authService.facebookLogin(facebookLoginDto);
    return {
      success: true,
      message: 'Facebook login successful',
      data: user,
    };
  }

  @Get('verify-email')
  async resendVerificationEmail(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const user = await this.authService.resendVerificationEmail(email);
    return {
      success: true,
      message: 'Verification email sent successfully',
      data: user,
    };
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const user = await this.authService.verifyEmail(verifyEmailDto.token);
    return {
      success: true,
      message: 'Email verified successfully',
      data: user,
    };
  }

  @Get('forgot-password')
  async generateForgotPasswordToken(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const user = await this.authService.generateForgotPasswordToken(email);
    return {
      success: true,
      message: 'Forgot password token generated and sent to email',
      data: user,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() changePasswordDto: ChangePasswordDto) {
    const user = await this.authService.resetPassword(changePasswordDto);
    return {
      success: true,
      message: 'Password reset successfully',
      data: user,
    };
  }

  @Get('refresh-token')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = request.headers['x-refresh-token'] as string;
    const newTokens = await this.authService.refreshTokens(token);
    res.setHeader('x-refresh-token', newTokens.refreshToken);
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: newTokens.accessToken,
      },
    };
  }

  @Delete('logout/:userId')
  async logoutUser(@Param('userId') userId: string, @Req() request: Request) {
    const token = request.headers['x-refresh-token'] as string;
    await this.authService.logout(userId, token || '');
    return {
      success: true,
      message: 'User logged out successfully',
    };
  }
}
