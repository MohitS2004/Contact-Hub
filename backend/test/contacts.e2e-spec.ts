import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/entities/user.entity';
import { Contact } from '../src/entities/contact.entity';
import * as bcrypt from 'bcrypt';

describe('ContactsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userRepo = dataSource.getRepository(User);
    const testUser = userRepo.create({
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: UserRole.USER,
    });
    const savedUser = await userRepo.save(testUser);
    userId = savedUser.id;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    const contactRepo = dataSource.getRepository(Contact);
    const userRepo = dataSource.getRepository(User);
    await contactRepo.delete({});
    await userRepo.delete({ email: 'test@example.com' });
    await app.close();
  });

  describe('/contacts (POST)', () => {
    it('should create a contact', () => {
      return request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Contact',
          email: 'contact@example.com',
          phone: '+1234567890',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Test Contact');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/contacts')
        .send({
          name: 'Test Contact',
          email: 'contact@example.com',
          phone: '+1234567890',
        })
        .expect(401);
    });
  });

  describe('/contacts (GET)', () => {
    it('should return paginated contacts', () => {
      return request(app.getHttpServer())
        .get('/contacts?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
        });
    });
  });

  describe('/contacts/export (GET)', () => {
    it('should export contacts as CSV', () => {
      return request(app.getHttpServer())
        .get('/contacts/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /text\/csv/)
        .expect((res) => {
          expect(res.text).toContain('Name,Email,Phone,Created At');
        });
    });
  });
});

