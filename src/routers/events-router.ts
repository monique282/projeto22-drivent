import { Router } from 'express';
import { eventGet } from '@/controllers';

const eventsRouter = Router();

eventsRouter.get('/', eventGet);

export { eventsRouter };
