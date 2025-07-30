import { User } from '@/modules/users/entities/user.entity';

export class CustomRequest extends Request {
  user?: User;
}
