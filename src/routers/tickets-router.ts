import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { ticketSchema } from '@/schemas/tickets-schemas';
import { createTicketPost, ticketGet, ticketTypesGet } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/', authenticateToken, ticketGet)
  .get('/types', ticketTypesGet)
  .post('/', authenticateToken, validateBody(ticketSchema), createTicketPost);

export { ticketsRouter };
