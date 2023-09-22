
import { ticketsService } from '@/services/tickets-service';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

// essa função serve para pegar todos os tickts, ingresos
export async function ticketsGet(req: Request, res: Response) {

  const ticket = await ticketsService.ticketsGet();

  return res.status(httpStatus.CREATED).send(ticket)
  
}

// essa função serve para pegar todos os tickts do usuario
export async function userTicketsGet(req: Request, res: Response) {

  const ticket = await ticketsService.userTicketsGet();

  return res.status(httpStatus.CREATED).send(ticket)
  
}

