import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { TicketTypeID, ticketService } from '@/services/tickets-service';

// essa função serve pra criar o ticket especifico na rota ticket/types
export async function ticketTypesGet(req: AuthenticatedRequest, res: Response) {
  const ticketTypes = await ticketService.ticketTypesGet();
  return res.status(httpStatus.OK).send(ticketTypes);
}

// essa função serve para pegar todos os tickets independente do usuario
export async function ticketGet(req: AuthenticatedRequest, res: Response) {
  const ticket = await ticketService.ticketGet(req.userId);
  return res.status(httpStatus.OK).send(ticket);
}

// essa função serve para criat um ticket na rota ticket
export async function createTicketPost(req: AuthenticatedRequest, res: Response) {
  const ticketTypeId = req.body as TicketTypeID;
  const response = await ticketService.createTicketPost(ticketTypeId, req.userId);
  res.status(httpStatus.CREATED).send(response);
}
