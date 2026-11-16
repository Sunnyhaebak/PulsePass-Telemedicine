import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class RazorpayWebhookDto {
  @IsString()
  @IsNotEmpty()
  event: string; // 'payment.captured' or 'order.paid'

  @IsObject()
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: {
          patientId?: string;
          doctorId?: string;
        };
      };
    };
  };
}
