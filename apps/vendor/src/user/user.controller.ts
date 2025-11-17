import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegistrationTypeEnum } from '../utils /constants';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FetchUserByBusinessDto } from './dto/fetch-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('createUser')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @MessagePattern('oAuthCreateUser')
  oAuthCreateUser(
    @Payload()
    data: {
      type: RegistrationTypeEnum;
      createUserDto: CreateUserDto;
    },
  ) {
    return this.userService.oAuthCreateUser(data.type, data.createUserDto);
  }

  @MessagePattern('findAllUser')
  findAll() {
    return this.userService.findAll();
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() id: string) {
    return this.userService.findOne(id);
  }

  @MessagePattern('findUserByBusiness')
  findUserByBusiness(@Payload() payload: FetchUserByBusinessDto) {
    return this.userService.getUsersByBusiness(payload);
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

  @MessagePattern(`verifyEmail`)
  verifyEmail(@Payload() token: string) {
    return this.userService.verifyEmail(token);
  }

  @MessagePattern('generateForgotPasswordToken')
  generateForgotPasswordToken(@Payload() email: string) {
    return this.userService.generateForgotPasswordToken(email);
  }

  @MessagePattern('changePassword')
  changePassword(@Payload() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(changePasswordDto);
  }

  @MessagePattern('authenticateUser')
  authenticateUser(@Payload() data: AuthenticateUserDto) {
    return this.userService.authenticateUser(data);
  }

  @MessagePattern('updateUser')
  update(@Payload() data: { id: string; updateUserDto: UpdateUserDto }) {
    return this.userService.update(data.id, data.updateUserDto);
  }

  @MessagePattern('updateUserProfile')
  updateprofile(
    @Payload() data: { id: string; updateUserDto: UpdateProfileDto },
  ) {
    return this.userService.updateProfile(data.id, data.updateUserDto);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: string) {
    return this.userService.remove(id);
  }
}
