/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ClientUser } from 'apps/gateway/types/client';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('client-jwt'))
@ApiBearerAuth()
@ApiTags('Client User')
@Controller('client/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  getMe(@Req() request: Request) {
    const user = (request as any).user as ClientUser;
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }
}
