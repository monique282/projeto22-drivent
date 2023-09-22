import { ticketsGet, userTicketsGet } from '@/controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';


const ticketsRouter = Router();

ticketsRouter
    .get('/types', authenticateToken, ticketsGet)
    .get('/', authenticateToken, userTicketsGet);

export { ticketsRouter };