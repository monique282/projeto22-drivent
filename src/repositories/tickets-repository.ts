import { prisma } from '@/config';
import {  TicketType } from '@prisma/client';

async function ticketsGet() {
    const ticket: TicketType[] = await prisma.ticketType.findMany();
    return ticket
}

export const ticketRepository = {
    ticketsGet
};
