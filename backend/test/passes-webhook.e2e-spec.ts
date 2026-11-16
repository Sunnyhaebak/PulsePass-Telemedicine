import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Passes Webhook & Activation (E2E Integration Test)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST passes/webhook/razorpay - activates pass and prevents duplicate execution on retry', async () => {
    const orderId = `order_test_${Date.now()}`;
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${Date.now()}`,
            order_id: orderId,
            amount: 50000,
            currency: 'INR',
            status: 'captured',
            notes: {
              patientId: 'test-patient-id',
              doctorId: 'test-doctor-id',
            },
          },
        },
      },
    };

    // First Webhook Call
    const res1 = await request(app.getHttpServer())
      .post('/passes/webhook/razorpay')
      .send(payload)
      .expect(200);

    expect(res1.body.status).toBe('ACTIVATED');

    // Duplicate Webhook Call (Simulating Razorpay network retry)
    const res2 = await request(app.getHttpServer())
      .post('/passes/webhook/razorpay')
      .send(payload)
      .expect(200);

    // Must be idempotent
    expect(res2.body.status).toBe('ALREADY_ACTIVATED');
  });
});
