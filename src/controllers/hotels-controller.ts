import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services/hotels-service';

// essa função serve para pegar todos os hoteis independente do usuario
export async function hotelsGet(req: AuthenticatedRequest, res: Response) {
  const hotels = await hotelsService.hotelsGet(req.userId);

  // deu tudo certo
  return res.status(httpStatus.OK).send(hotels);
}

// essa função serve para pegar os quartos de um hotel específico usado id
export async function searchingHotelRoomsyIdGet(req: AuthenticatedRequest, res: Response) {
  // verificando se o id do hotel é valido
  if (!req.params.hotelId || isNaN(parseInt(req.params.hotelId))) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  // transformando o id do hotel em um numero
  const hotelId = Number(req.params.hotelId);

  const hotel = await hotelsService.searchingHotelRoomsyIdGet(hotelId, req.userId);

  // deu tudo certo
  return res.status(httpStatus.OK).send(hotel);
}
