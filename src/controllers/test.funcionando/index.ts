import { Request, Response } from 'express';
import httpStatus from 'http-status';

export async function singInPost(req: Request, res: Response) {
  return res.status(httpStatus.OK).send(200);
}
