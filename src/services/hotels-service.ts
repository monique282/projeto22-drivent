

import { notFoundType } from '@/errors';
import { paymentError } from '@/errors/payments-error';
import { enrollmentRepository } from '@/repositories';
import { hotelsRepository } from '@/repositories/hotels-repository';
import { Hotel, Room } from '@prisma/client';

export type HotelsRooms = Hotel & {
    Rooms: Room[];
};




async function hotelsGet(userId: number): Promise<Hotel[]> {

    const enrollment = await enrollmentRepository.registrationWithTicket(userId);

    //  verificando se a inscriçãp do usuario é valido
    if (!enrollment) {
        throw notFoundType('Enrollment not found');
    }

    // verificando se o hotel esta pago
    if (enrollment.Ticket.status !== 'PAID') {
        throw paymentError('Call the hotel');
    };

    // verificando se o ticket foi encontrado
    if (!enrollment.Ticket) {
        throw notFoundType('Ticket not found, there are no hotels');
    };

    // verificando se o ticket tem um hotel junto
    if (!enrollment.Ticket.TicketType.includesHotel) {
        throw paymentError('Ticket without hotel inclusion');
    };

    // verificando se o tocket é remoto
    if (enrollment.Ticket.TicketType.isRemote) {
        throw paymentError('Remote ticket');
    }

    // se tudo der certo
    const hotels = await hotelsRepository.hotelsGet();

    // verificando se a lista de hotels que veio pelo banco é valida ou vazia
    if (!hotels || hotels.length === 0) {
        throw notFoundType('Hotels not found');
    };

    // se der tudo certo
    return hotels;
}

export const hotelsService = {
    hotelsGet
};
