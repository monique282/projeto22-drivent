import { ticketsGet } from '@/controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';


const ticketsRouter = Router();

ticketsRouter
    .get('/types', authenticateToken, ticketsGet)
    .get('/', authenticateToken, ticketsGet);

export { ticketsRouter };