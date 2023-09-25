import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { enrollmentByUserGet, updaCreEnrollmentPost, addressCepGet } from '@/controllers';
import { createOrUpdateEnrollmentSchema } from '@/schemas';

const enrollmentsRouter = Router();

enrollmentsRouter
  .get('/cep', addressCepGet)
  .all('/*', authenticateToken)
  .get('/', enrollmentByUserGet)
  .post('/', validateBody(createOrUpdateEnrollmentSchema), updaCreEnrollmentPost);

export { enrollmentsRouter };
