import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const signupEmail = 'aloha02@gmail.com';

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: signupEmail,
        password: 'mypw',
      })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(signupEmail);
      });
  });

  it('signup as a new user then get the currently logged in user', async () => {
    const email = 'hello@world.com';

    const singupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: 'foobar',
      })
      .expect(201);

    const cookieRes = singupRes.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .send({ email: email, password: 'foobar' })
      .set('Cookie', cookieRes)
      .expect(200);

    expect(body.email).toEqual(email);
  });
});
