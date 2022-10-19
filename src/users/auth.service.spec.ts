import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Fake copy of user service
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('banana@bar.com', 'testpw');

    expect(user.password).not.toEqual('testpw');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    // First
    await service.signup('banana@bar.com', 'testpw');

    // Second
    await expect(service.signup('banana@bar.com', 'testpw')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throw if an invalid password is provided', async () => {
    await service.signup('aventador@bar.com', 'testpw')

    await expect(service.signin('aventador@bar.com', 'testpw2077')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'testpw');

    const user = await expect(service.signin('asdf@asdf.com', 'testpw'));
    expect(user).toBeDefined();
  });
});
