import { User } from '@prisma/client';

export class TokenDto {
  accessToken: string;
  user: User;
}
