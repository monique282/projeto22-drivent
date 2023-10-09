import { notFoundType } from '@/errors';
import { ticketsRepository } from '@/repositories/tickets-repository';
import { enrollmentRepository } from '@/repositories';
import { forbiddenError } from '@/errors/forbidden-error';
import { bookingRepository } from '@/repositories/booking-repository';

// essa função serve para pegar as reservar se um usuario especifico
async function bookingUserGet(userId: number) {

    // buscando a reserva do usuario pelo id
    const booking = await bookingRepository.userGet(userId);

    // se não vier nada
    if (!booking) {
        throw notFoundType('Reserva não encontrada, não existe hoteis para você')
    };

    delete booking.userId;
    delete booking.createdAt;
    delete booking.updatedAt;
    delete booking.roomId;
    return booking;
};


// essa função serve para criar uma reserva
async function bookingPost(roomId: number, userId: number) {

    // buscando o quarto
    // fix
    const room = await bookingRepository.roomIdGet(roomId);

    // se ele não existir
    if (!room) {
        throw notFoundType('Quarto não encontrado')
    };

    // se ele existe ver sua capacidade
    if (room.Booking.length >= room.capacity) {
        throw forbiddenError('The room no longer fits people, maximum capacity reached')
    };

    // procurando o endereço do usuario usando o id
    const enrollment = await enrollmentRepository.findAddressById(userId);

    // se o endereço existe
    if (!enrollment) {
        throw forbiddenError('Inscrição não encontrada')
    };

    // fix
    const ticket = await ticketsRepository.ticketGet(userId);

    //  verificando se é valido
    if (!ticket) {
        throw forbiddenError('Ticket not found');
    };

    // verificando se foi encontrado
    if (!ticket.TicketType) {
        throw forbiddenError('TicketType not found');
    };

    // verificando se é remoto
    if (ticket.TicketType.isRemote) {
        throw forbiddenError('Ticket is remote');
    };


    // verificando se tem um hotel junto
    if (ticket.TicketType.includesHotel == false) {
        throw forbiddenError('Ticket does not include hotel');
    };

    // verificando se esta pago
    if (ticket.status !== 'PAID') {
        throw forbiddenError('Ticket is not paid');
    };

    // se estiver tudo certo
    // fix
    const booking = await bookingRepository.bookingPost(userId, roomId);
    const result = { bookingId: booking.id };
    return result;
};


// essa função serve para atualizar a reserva
async function bookingUpdate(roomId: number, bookingId: number | string | undefined | null, userId: number) {

    // verificando o id da reserva
    if (isNaN(Number(bookingId)) || bookingId == '0') {
        throw notFoundType('The reservation id is not a number');
    };

    // pegando o quarto pelo id
    const room = await bookingRepository.roomIdGet(roomId);

    // se ele não existe
    if (!room) {
        throw notFoundType('Quarto não encontrado');
    };

    // pegando a reserva pelo id do usuario
    // fix
    const booking = await bookingRepository.userGet(userId);

    // se ela nao existir
    if (!booking) {
        throw forbiddenError('Booking not found');
    };

    // se o quarto ja estiver em sua capacidade maxima
    if (room.Booking.length >= room.capacity) {
        throw forbiddenError('The room no longer fits people, maximum capacity reached');
    }

    // se tudo der certo
    const bookingUpdate = await bookingRepository.bookingUpdate(Number(bookingId), roomId);
    const result = { bookingId: bookingUpdate.id };
    return result;
};

export const bookingService = {
    bookingUserGet,
    bookingPost,
    bookingUpdate,
};