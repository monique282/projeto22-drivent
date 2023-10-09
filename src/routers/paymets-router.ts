import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { paymentPostSchema } from '@/schemas/payments-schemas';
import { paymentGet, paymentPost } from '@/controllers/payment-controller';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', paymentGet)
  .post('/process', validateBody(paymentPostSchema), paymentPost);

export { paymentsRouter };
