import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { enrollmentsService } from '@/services';
import { CEP } from '@/protocols';

// essa função seve para pegar todas as inscrições
export async function enrollmentByUserGet(req: AuthenticatedRequest, res: Response) {

  // pegando o id do usuario pelo req
  const { userId } = req;

  const enrollmentWithAddress = await enrollmentsService.addressAtGet(userId);
  return res.status(httpStatus.OK).send(enrollmentWithAddress);
}

// essa função serve para criar ou atualizar o endereço
export async function updaCreEnrollmentPost(req: AuthenticatedRequest, res: Response) {
  await enrollmentsService.updaCreEnrollmentPost({
    ...req.body,
    userId: req.userId,
  });

  return res.sendStatus(httpStatus.OK);
}

// essa função serve para pegar o endereço pelo cep
export async function addressCepGet(req: AuthenticatedRequest, res: Response) {

  // pegando o cep enviado pela query que o cliente digitou
  const { cep } = req.query as CEP;

  const address = await enrollmentsService.addressCepGet(cep);
  res.status(httpStatus.OK).send(address);
}
