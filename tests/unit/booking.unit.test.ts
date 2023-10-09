import { enrollmentRepository } from '@/repositories';
import { bookingRepository } from '@/repositories/booking-repository';
import { ticketsRepository } from '@/repositories/tickets-repository';
import { bookingService } from '@/services/booking-service';

describe('GET /booking', () => {
  //Retornar uma reserva se existe para o usuario
  it('Return a reservation if it exists for the user', async () => {
    // pegandoa as informações da reserva usando o id do usuario
    const bookingResult = { Booking: { id: 1, Room: {} } };
    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return bookingResult;
    });
    const booking = bookingService.bookingUserGet(1);
    expect(booking).resolves.toEqual(bookingResult);
  });

  //Retornar quando não existe reserva para o usuário
  it('Return when there is no reservation for the user', async () => {
    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return null;
    });

    const booking = bookingService.bookingUserGet(1);
    expect(booking).rejects.toEqual({
      name: 'NotFoundError',
      message: 'Reserva não encontrada, não existe hoteis para você',
    });
  });
});

describe('POST /booking', () => {
  //Retornar se p quarto não existe
  it('Return if room does not exist', async () => {
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return null;
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'NotFoundError',
      message: 'Quarto não encontrado',
    });
  });

  //Retornar quando o quarto ja ta em sua capacidade maxima
  it('Return when the room is at maximum capacity', async () => {
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 1,
        Booking: [1, 2],
      };
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'The room no longer fits people, maximum capacity reached',
    });
  });

  //Retoranar se não existe escrição para determinado usuario
  it('Return if there is no writing for a given user', async () => {
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return null;
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Inscrição não encontrada',
    });
  });

  //Retornar, usuario sem ticket
  it('Return, user without ticket', async () => {
    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return null;
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket not found',
    });
  });

  //Retornar, usuario não pagou
  it('Return, user did not pay', async () => {
    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'RESERVED', TicketType: { includesHotel: true, isRemote: false } };
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket is not paid',
    });
  });

  //Retornar, ticket sem hotel
  it('Return, ticket without hotell', async () => {
    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: false, isRemote: false } };
    });

    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return {
        Booking: null,
        Room: null,
      };
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket does not include hotel',
    });
  });

  //Retornar, ticket remoto
  it('Return, remote ticket', async () => {
    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: true } };
    });

    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return {
        Booking: null,
        Room: null,
      };
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Ticket is remote',
    });
  });

  //Retornar os dados da reserva apor a criação de uma
  it('Return reservation data after creating a reservation', async () => {
    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return {
        capacity: 10,
        Booking: [1, 2],
      };
    });
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return {
        Booking: null,
        Room: null,
      };
    });
    const id = 1;
    jest.spyOn(bookingRepository, 'bookingPost').mockImplementationOnce((): any => {
      return { id };
    });
    const booking = bookingService.bookingPost(1, 1);
    expect(booking).resolves.toEqual({ bookingId: id });
  });
});

describe('PUT /booking', () => {
  //Retoranr, quarto não existe
  it('Retoranr, room does not exist', async () => {
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return null;
    });
    jest.spyOn(bookingRepository, 'bookingUpdate').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    const booking = bookingService.bookingUpdate(0, 1, 1);
    expect(booking).rejects.toEqual({
      name: 'NotFoundError',
      message: 'Quarto não encontrado',
    });
  });

  //Retornar, quarto sem espaço
  it('Return, room no space', async () => {
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });

    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return { capacity: 1, Booking: [1, 2] };
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return { capacity: 1, Booking: [1, 2] };
    });

    jest.spyOn(bookingRepository, 'bookingUpdate').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    const booking = bookingService.bookingUpdate(1, 1, 1);

    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'The room no longer fits people, maximum capacity reached',
    });
  });

  //Retornar, não existe reserva
  it('Return, there is no booking', async () => {
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });

    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return null;
    });
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return { id: 0, Booking: [1, 2] };
    });
    jest.spyOn(bookingRepository, 'bookingUpdate').mockImplementationOnce((): any => {
      return { id: 0 };
    });
    const booking = bookingService.bookingUpdate(1, 1, 1);
    expect(booking).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Booking not found',
    });
  });

  //Retornar os dados da reserva apos uma atualização
  it('Return reservation data after an update', async () => {
    jest.spyOn(ticketsRepository, 'ticketGet').mockImplementationOnce((): any => {
      return { status: 'PAID', TicketType: { includesHotel: true, isRemote: false } };
    });

    jest.spyOn(enrollmentRepository, 'findAddressById').mockImplementationOnce((): any => {
      return { id: 0 };
    });

    jest.spyOn(bookingRepository, 'userGet').mockImplementationOnce((): any => {
      return { id: 1 };
    });
    const id = 1;
    jest.spyOn(bookingRepository, 'roomIdGet').mockImplementationOnce((): any => {
      return { id, Booking: [1, 2] };
    });
    jest.spyOn(bookingRepository, 'bookingUpdate').mockImplementationOnce((): any => {
      return { id };
    });

    const booking = bookingService.bookingUpdate(1, 1, 1);
    expect(booking).resolves.toEqual({ bookingId: id });
  });
});
