import { User } from '@app/shared/types/vendor';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';

const RoleGuard = (roles: string[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<{ user: User }>();
      const user = request.user;
      console.log(user);
      return roles.includes(user?.roleName);
    }
  }
  return mixin(RoleGuardMixin);
};

export default RoleGuard;
