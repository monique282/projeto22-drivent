import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { hotelsGet, searchingHotelRoomsyIdGet } from '@/controllers/hotels-controller';

const hotelsRouter = Router();

hotelsRouter
  .all('/*', authenticateToken)
  .get('/', authenticateToken, hotelsGet)
  .get('/:hotelId', searchingHotelRoomsyIdGet);
export { hotelsRouter };
