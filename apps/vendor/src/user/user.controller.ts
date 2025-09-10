import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('findAllUser')
  findAll() {
    return this.userService.findAll();
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() id: string) {
    return this.userService.findOne(id);
  }

  @MessagePattern('findOneUserByEmail')
  findOneByEmail(@Payload() email: string) {
    return this.userService.findOneByEmail(email);
  }

  @MessagePattern('resendVerificationEmail')
  async resendVerificationEmail(@Payload() email: string) {
    const user = await this.userService.findOneByEmail(email);
    return this.userService.sendConfirmUserEmail(user);
  }

  @MessagePattern('authenticateUser')
  authenticateUser(@Payload() data: AuthenticateUserDto) {
    return this.userService.authenticateUser(data);
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: string) {
    return this.userService.remove(id);
  }
}
