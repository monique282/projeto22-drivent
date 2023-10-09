import { Ticket, TicketType } from '@prisma/client';
import { ticketsRepository } from '@/repositories/tickets-repository';
import { enrollmentRepository } from '@/repositories';
import { notFoundType } from '@/errors';

export type TicketResp = {
  id: number;
  status: string;
  ticketTypeId: number;
  enrollmentId: number;
  TicketType: {
    id: number;
    name: string;
    price: number;
    isRemote: boolean;
    includesHotel: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

// criando o ticke atravez dos dados enviados pelo usuario
async function createTicketPost(id: TicketTypeID, userId: number): Promise<TicketResp> {
  const tickedTypeId = id.ticketTypeId;
  const enrollment = await enrollmentRepository.findAddressById(userId);

  // verificando se a inscrição do usuario é valido
  if (!enrollment) {
    throw notFoundType('Enrollment not found');
  }

  // se der tudo certo
  const result = ticketsRepository.create(tickedTypeId, enrollment.id);
  return result;
}

async function ticketTypesGet(): Promise<TicketType[] | null> {
  const types = await ticketsRepository.ticketTypesGet();
  return types;
}

async function ticketGet(ownerId: number): Promise<TicketResp | null> {
  const ticket = await ticketsRepository.ticketGet(ownerId);

  // verificando se a lista de tickets que veio pelo banco é valida
  if (!ticket) {
    throw notFoundType('Ticket not found');
  }

  // se der tudo certo
  return ticket;
}

export type TicketTypeID = { ticketTypeId: number };

export const ticketService = {
  createTicketPost,
  ticketGet,
  ticketTypesGet,
};
