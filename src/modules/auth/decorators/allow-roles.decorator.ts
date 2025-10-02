import { SetMetadata } from '@nestjs/common';

import { Role } from '@/modules/auth/enums/role.enum';

export const ALLOW_ROLES_KEY = 'allowRoles';

export const AllowRoles = (roles: Role[] = Object.values(Role)) =>
  SetMetadata(ALLOW_ROLES_KEY, roles);
