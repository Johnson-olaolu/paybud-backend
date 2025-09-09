import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { defaultRoles } from '../utils /constants';
import { RoleService } from '../user/role/role.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);
  constructor(private roleService: RoleService) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
  }

  async seedRoles() {
    for (const role of defaultRoles) {
      let foundRole;
      try {
        foundRole = await this.roleService.findOneByName(role.name);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
      if (!foundRole) {
        await this.roleService.create(role);
        this.logger.log(`Role : ${role.name} Seeded`);
      }
    }
  }
}
