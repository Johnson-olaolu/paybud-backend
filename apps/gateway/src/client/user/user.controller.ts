/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ClientUser } from '@app/shared/types/client';

@UseGuards(AuthGuard('client-jwt'))
@ApiBearerAuth()
@ApiTags('Client User')
@Controller('client/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return {
      success: true,
      message: 'User created successfully',
      data,
    };
  }

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
