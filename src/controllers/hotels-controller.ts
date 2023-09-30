import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services/hotels-service';


// essa função serve para pegar todos os hoteis independente do usuario
export async function hotelsGet(req: AuthenticatedRequest, res: Response) {
  const hotels = await hotelsService.hotelsGet();
  return res.status(httpStatus.OK).send(hotels);
}


