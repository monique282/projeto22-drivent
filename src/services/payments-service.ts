import { ticketService } from './tickets-service';
import { PaymentBody } from '@/schemas/payments-schemas';
import { notFoundType, unauthorizedType } from '@/errors';
import { ticketsRepository } from '@/repositories/tickets-repository';
import { badRequestError } from '@/errors/cep-error';
import { paymentRepository } from '@/repositories/payment-repository';

export type PaymentResponse = {
  id: number;
  ticketId: number;
  value: number;
  cardIssuer: string;
  cardLastDigits: string;
  createdAt: Date;
  updatedAt: Date;
};

async function paymentPost(body: PaymentBody, userId: number): Promise<PaymentResponse | null> {
  const ticket = await ticketsRepository.ticketExistsGet(Number(body.ticketId));

  // se o ticket não existir
  if (!ticket) {
    throw notFoundType('Ticket not found');
  }

  const ticketOfUser = await ticketsRepository.ticketEnrollmentGet(body.ticketId);

  // verificando se o ticket do usuario existe
  if (!ticketOfUser || ticketOfUser.Enrollment.userId !== userId) {
    throw unauthorizedType('User does not own this ticket');
  }

  const payment = await paymentRepository.paymentPost(body, ticketOfUser.TicketType.price);
  return payment;
}

async function paymentGet(ticketId: number, userRequesterId: number): Promise<PaymentResponse | null> {
  // verificando se o if do ticket é valido
  if (!ticketId || isNaN(ticketId)) {
    throw badRequestError('TicketId is required');
  }

  const ticketExists = await ticketsRepository.ticketExistsGet(Number(ticketId));

  // se for valido verificando se ele existe no banco
  if (!ticketExists) {
    throw notFoundType('Ticket not found');
  }

  const ticketOfUser = await ticketsRepository.ticketEnrollmentGet(ticketId);

  // se ele existe verificando se ele é so usuario
  if (!ticketOfUser || ticketOfUser.Enrollment.userId !== userRequesterId) {
    throw unauthorizedType('User does not own this ticket');
  }

  const payment = await paymentRepository.paymentGet(ticketId);

  // se ele for do usuario verificando se ele foi pago
  if (!payment) {
    throw notFoundType('Payment not found');
  }

  // se tudo der certo
  return payment;
}

export const paymentService = {
  paymentGet,
  paymentPost,
};
