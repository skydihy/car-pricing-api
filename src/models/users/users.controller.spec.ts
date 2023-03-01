import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersController } from './users.controller';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'asdf@asdf.com',
          password: 'mypw',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'mypw' } as User]);
      },
      remove: (id: number) => {
        return Promise.resolve({
          id: 1,
          email: 'asdf@asdf.com',
          password: 'mypw',
        } as User);
      },
      update: (id: number, attrs: Partial<User>) => {
        return Promise.resolve({
          id: id,
          email: attrs.email ?? 'asdf@asdf.com',
          password: attrs.password ?? 'mypw',
        } as User);
      },
    };

    fakeAuthService = {
      signup: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdf@asdf.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('asdf@asdf.com');
    expect(user).toBeDefined();
  });

  it('findUser thorws an error if user with given id not found', async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -1 };
    const user = await controller.signin(
      {
        email: 'asdf@asdf.com',
        password: 'asdf',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });

  it('remove user by given id', async () => {
    const userRemoved = await controller.removeUser('1');
    expect(userRemoved.id).toEqual(1);
  });

  it('update user email by given id and', async () => {
    const user = await controller.updateUser('1', {
      email: 'asdf2@asdf.com',
    } as User);

    expect(user.id).toEqual(1);
    expect(user.email).toEqual('asdf2@asdf.com');
    expect(user.password).toEqual('mypw');
  });
});
