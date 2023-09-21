import { Ticket } from '@prisma/client';
import dayjs from 'dayjs';
import { notFoundError } from '@/errors';

async function ticketsGet(): Promise<Ticket> {


    const ticket = await ticketsRepository.ticketsGet();
  
    return ticket
  }


  export const ticketsService = {
    ticketsGet
  };