import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { eventsService } from '@/services';

// essa função pega todos os eventos
export async function eventGet(_req: Request, res: Response) {
  const event = await eventsService.eventGet();
  return res.status(httpStatus.OK).send(event);
}
