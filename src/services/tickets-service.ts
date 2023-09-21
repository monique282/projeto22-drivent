import {TicketType } from '@prisma/client';
import { ticketRepository } from '@/repositories/tickets-repository';

async function ticketsGet(): Promise<TicketType[]> {
    const ticket = await ticketRepository.ticketsGet()

    return ticket
  }


  export const ticketsService = {
    ticketsGet
  };