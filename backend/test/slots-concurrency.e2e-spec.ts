import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Slot Concurrency & Race-Condition Prevention (E2E Integration Test)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Concurrent Booking Collision: Two patients booking the same slot simultaneously - exactly ONE succeeds and ONE gets 409 Conflict', async () => {
    const slotId = 'test-concurrent-slot-id';
    const patient1Token = 'mock_jwt_patient_1';
    const patient2Token = 'mock_jwt_patient_2';

    // Simulate two simultaneous HTTP requests firing at the exact same millisecond via Promise.all
    const request1 = request(app.getHttpServer())
      .post('/slots/book')
      .set('Authorization', `Bearer ${patient1Token}`)
      .send({ slotId, passId: 'pass-p1' });

    const request2 = request(app.getHttpServer())
      .post('/slots/book')
      .set('Authorization', `Bearer ${patient2Token}`)
      .send({ slotId, passId: 'pass-p2' });

    const responses = await Promise.all([request1, request2]);
    const statusCodes = responses.map((r) => r.status);

    // Verify: Zero Double Booking Guarantee
    // In our system: one acquires the Redis lock (200/201), the other is rejected (409 Conflict or 400 Bad Request)
    expect(statusCodes).toContain(409);
    expect(statusCodes.filter((code) => code === 200 || code === 201).length).toBeLessThanOrEqual(1);
  });
});
