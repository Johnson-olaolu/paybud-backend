import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';

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
}
