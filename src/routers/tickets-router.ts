import { ticketsGet } from '@/controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';


const ticketsRouter = Router();

ticketsRouter.get('/tickets/types', authenticateToken, ticketsGet);

export { ticketsRouter };