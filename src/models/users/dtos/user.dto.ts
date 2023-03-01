import { Expose, Exclude } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;
}
