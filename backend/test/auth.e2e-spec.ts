import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Authentication Flow (E2E Integration Test)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    fullName: 'Ananya Roy',
    phone: `+91987${Math.floor(1000000 + Math.random() * 9000000)}`,
    email: `ananya.${Date.now()}@example.com`,
    password: 'password123',
    role: 'PATIENT',
  };

  it('/POST auth/register - registers patient and returns JWT', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user.role).toBe('PATIENT');
      });
  });

  it('/POST auth/login - authenticates registered user', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user.fullName).toBe(testUser.fullName);
      });
  });

  it('/GET auth/me - rejects request without Bearer token with 401', async () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });
});
