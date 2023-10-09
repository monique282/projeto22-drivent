import { prisma } from '@/config';

// pegando o usuario pelo id
async function userGet(userId: number) {
  return prisma.booking.findFirst({
    where: { userId: userId },
    include: {
      Room: true,
    },
  });
}

// criando a reserva
async function bookingPost(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

// atualizando reserva
async function bookingUpdate(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

// pegando as informações do quarto
async function roomGet(id: number) {
  return await prisma.room.findUnique({
    where: { id },
    select: {
      capacity: true,
      _count: { select: { Booking: true } },
    },
  });
}

// verificando se o quarto esiste pelo id
async function roomIdGet(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    },
  });
}

export const bookingRepository = {
  userGet,
  bookingPost,
  bookingUpdate,
  roomIdGet,
  roomGet,
};
