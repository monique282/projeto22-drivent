import { Router } from 'express';
import { authenticateToken} from '@/middlewares';
import { hotelsGet } from '@/controllers/hotels-controller';

const hotelsRouter = Router();

hotelsRouter
    .all('/*', authenticateToken)
    .get('/', authenticateToken, hotelsGet)

export { hotelsRouter };
