import { Hotel, Room } from '@prisma/client';
import { notFoundType } from '@/errors';
import { paymentError } from '@/errors/payments-error';
import { enrollmentRepository } from '@/repositories';
import { hotelsRepository } from '@/repositories/hotels-repository';

// tipando a lista de quarto por hotel
export type HotelsRooms = Hotel & {
  Rooms: Room[];
};

// fazendo as regras para pegar todos os hoteis
async function hotelsGet(userId: number): Promise<Hotel[]> {
  // fazendo a requisição para ver se o cadastro esta de acordo com as regras de negocio
  const enrollment = await enrollmentRepository.registrationWithTicket(userId);

  //  verificando se a inscriçãp do usuario é valido
  if (!enrollment) {
    throw notFoundType('Enrollment not found');
  }

  // verificando se o ticket foi encontrado
  if (!enrollment.Ticket) {
    throw notFoundType('Ticket not found, there are no hotels');
  }

  // verificando se o ticket tem um hotel junto
  if (!enrollment.Ticket.TicketType.includesHotel) {
    throw paymentError('Ticket without hotel inclusion');
  }

  // verificando se o tocket é remoto
  if (enrollment.Ticket.TicketType.isRemote) {
    throw paymentError('Remote ticket');
  }

  // verificando se o hotel esta pago
  if (enrollment.Ticket.status !== 'PAID') {
    throw paymentError('Call the hotel');
  }

  // se tudo der certo, pegar a lista de hoteis
  const hotels = await hotelsRepository.hotelsGet();

  // verificando se a lista dos hoteis é valida
  if (!hotels || hotels.length == 0) {
    throw notFoundType('Empty hotel list');
  }

  // se tiver dado tudo certo
  return hotels;
}

// fazendo as regras para pegar todos os quarto de acordo com um hotel especifico
async function searchingHotelRoomsyIdGet(hotelId: number, userId: number): Promise<Hotel & { Rooms: Room[] }> {
  // fazendo a requisição para ver se o cadastro esta de acordo com as regras de negocios
  const enrollment = await enrollmentRepository.registrationWithTicket(userId);

  //  verificando se a inscriçãp do usuario é valido
  if (!enrollment) {
    throw notFoundType('Enrollment not found');
  }

  // verificando se o ticket foi encontrado
  if (!enrollment.Ticket) {
    throw notFoundType('Ticket not found, there are no hotels');
  }

  // verificando se o hotel esta pago
  if (enrollment.Ticket.status !== 'PAID') {
    throw paymentError('Call the hotel');
  }

  // verificando se o ticket tem um hotel junto
  if (!enrollment.Ticket.TicketType.includesHotel) {
    throw paymentError('Ticket without hotel inclusion');
  }

  // verificando se o tocket é remoto
  if (enrollment.Ticket.TicketType.isRemote) {
    throw paymentError('Remote ticket');
  }

  const rooms = await hotelsRepository.hotelRoomsGet(hotelId);

  // verificando os hoteis
  if (!rooms) {
    throw notFoundType('Empty hotel list');
  }

  return rooms;
}

export const hotelsService = {
  hotelsGet,
  searchingHotelRoomsyIdGet,
};
