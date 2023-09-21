import { unauthorizedError } from '@/errors';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

// essa função serve para pegar todos os tickrts
export async function ticketsGet(req: Request, res: Response) {

  const ticket = await ticketsService.ticketsGet();

  return res.status(httpStatus.CREATED).send(ticket)
  
}
