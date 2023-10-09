import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas/booking-schemas';
import { bookingPost, bookingUpdate, bookingUserGet } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter
  .get('/', authenticateToken, bookingUserGet)
  .post('/', authenticateToken, validateBody(bookingSchema), bookingPost)
  .put('/:bookingId', authenticateToken, validateBody(bookingSchema), bookingUpdate);

export { bookingRouter };
