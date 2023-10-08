import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApplicationError, RequestError } from '@/protocols';

export function handleApplicationErrors(
  err: RequestError | ApplicationError | Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {

  // erro 400
  if (err.name === 'dateErrorAtTheBeginning') {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: err.message,
    });
  }

  // erro 409
  if (err.name === 'ConflictError' || err.name === 'DuplicatedEmailError') {
    return res.status(httpStatus.CONFLICT).send({
      message: err.message,
    });
  }

  // erro 401
  if (err.name === 'InvalidCredentialsError' || err.name === 'JsonWebTokenError') {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: err.message,
    });
  }

  // erro 400
  if (err.name === 'InvalidDataError' || err.name === 'BadRequestError') {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: err.message,
    });
  }

  // erro 404
  if (err.name === 'NotFoundError') {
    return res.status(httpStatus.NOT_FOUND).send({
      message: err.message,
    });
  }

  // erro 409
  if (err.name === 'DuplicatedEmailError') {
    return res.status(httpStatus.CONFLICT).send({
      message: err.message,
    });
  }

  // erro 401
  if (err.name === 'UnauthorizedError') {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: err.message,
    });
  }

  // erro 400
  if (err.name === 'EnrollmentNotFoundError') {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  // erro 400
  if (err.name === 'InvalidCEPError') {
    return res.status(httpStatus.BAD_REQUEST).send(err.message);
  }

  if (err.name === 'CannotListHotelsError') {
    return res.status(httpStatus.PAYMENT_REQUIRED).send(err.message);
  }

  if (err.hasOwnProperty('status') && err.name === 'RequestError') {
    return res.status((err as RequestError).status).send({
      message: err.message,
    });
  }

  // erro 402
  if (err.name === 'PaymentError') {
    return res.status(httpStatus.PAYMENT_REQUIRED).send({
      message: err.message,
    });
  }

  // erro 403
  if (err.name === 'ForbiddenError') {
    return res.status(httpStatus.FORBIDDEN).send({
      message: err.message,
    });
  }

  //erro 500
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
    error: 'InternalServerError',
    message: 'Internal Server Error',
  });
}
