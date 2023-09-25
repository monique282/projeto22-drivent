import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { paymentService } from '@/services';
import { PaymentBody } from '@/schemas/payments-schemas';

// essa função serve para pegar tudo referente a pagamentos
export async function paymentGet(req: AuthenticatedRequest, res: Response) {
  const payment = await paymentService.paymentGet(Number(req.query.ticketId), req.userId);
  return res.status(httpStatus.OK).send(payment);
}

// esssa função serve para enviar refente a pagamento
export async function paymentPost(req: AuthenticatedRequest, res: Response) {
  const payment = await paymentService.paymentPost(req.body as PaymentBody, req.userId);
  return res.status(httpStatus.OK).send(payment);
}
