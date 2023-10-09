import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services/booking-service';

// pegando a reserva pelo id do usuario
export async function bookingUserGet(req: AuthenticatedRequest, res: Response) {
  // pegando o id do usuario
  const { userId } = req;

  const booking = await bookingService.bookingUserGet(userId);

  // se tufo der certo
  return res.status(httpStatus.OK).send(booking);
}

// criando uma reserva
export async function bookingPost(req: AuthenticatedRequest, res: Response) {
  // pegando as informações enviadas pelo usuario
  const { roomId } = req.body;

  const booking = await bookingService.bookingPost(roomId, req.userId);

  // se tufo der certo
  return res.status(httpStatus.OK).send(booking);
}

// atualizando uma reserva
export async function bookingUpdate(req: AuthenticatedRequest, res: Response) {
  // pegando as informações enviadas pelo usuario
  const { roomId } = req.body;

  // pegando as informações enviadas pelo params
  const { bookingId } = req.params;

  const booking = await bookingService.bookingUpdate(roomId, bookingId, req.userId);

  // se tufo der certo
  res.status(httpStatus.OK).send(booking);
}
