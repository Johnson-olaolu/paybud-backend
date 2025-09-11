import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleModule } from './role/role.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [RoleModule, TypeOrmModule.forFeature([User, Profile])],
  exports: [RoleModule, UserService],
})
export class UserModule {}
