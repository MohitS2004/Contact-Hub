import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // Clean up test data
    const userRepo = dataSource.getRepository(User);
    await userRepo.delete({ email: 'testregister@example.com' });
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testregister@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe('testregister@example.com');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testlogin@example.com',
          password: 'password123',
        });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('user');
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrong-password',
        })
        .expect(401);
    });
  });
});

