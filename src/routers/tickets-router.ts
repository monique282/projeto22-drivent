import { Router } from 'express';


const ticketsRouter = Router();

ticketsRouter.get('/tickets/types');

export { ticketsRouter };