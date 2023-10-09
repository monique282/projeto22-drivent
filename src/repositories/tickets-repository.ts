import { Enrollment, Ticket, TicketStatus } from '@prisma/client';
import { prisma } from '@/config';
import { TicketResp } from '@/services/tickets-service';

export type TicketRespEnrollment = {
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
  Enrollment: Enrollment;
  createdAt: Date;
  updatedAt: Date;
};

// pegando todos os tickets
async function ticketGet(userId: number): Promise<TicketResp | null> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
  return ticket as TicketResp;
}

// pegando os ingreços que estão inscritos validos
async function ticketEnrollmentGet(tickedId: number): Promise<TicketRespEnrollment | null> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: tickedId,
    },
    include: {
      TicketType: true,
      Enrollment: true,
    },
  });
  return ticket as TicketRespEnrollment;
}

// pegandos os tikets que foram pagos
async function ticketPriceGet(tickedId: number): Promise<number | null> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: tickedId,
    },
    include: {
      TicketType: true,
    },
  });

  return ticket.TicketType.price;
}

// pegandos os ingrasos por types
async function ticketTypesGet() {
  return prisma.ticketType.findMany();
}

// criando o ticket
async function create(ticketId: number, enrollmentId: number): Promise<TicketResp> {
  const ticket = await prisma.ticket.create({
    data: {
      enrollmentId: enrollmentId,
      ticketTypeId: ticketId,
      status: TicketStatus.RESERVED,
    },
  });
  const tickedType = await prisma.ticketType.findFirst({
    where: {
      id: ticketId,
    },
  });

  const result: TicketResp = {
    id: ticket.id,
    status: ticket.status.toString(),
    ticketTypeId: ticket.ticketTypeId,
    enrollmentId: ticket.enrollmentId,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    TicketType: tickedType,
  };

  return result;
}

// função para validar e existencia do ticket
async function ticketExistsGet(ticketId: number): Promise<boolean> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
  });
  return ticket !== null;
}

export const ticketsRepository = {
  create,
  ticketGet,
  ticketTypesGet,
  ticketExistsGet,
  ticketPriceGet,
  ticketEnrollmentGet,
};
