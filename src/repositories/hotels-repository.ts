
import { prisma } from '@/config';
import { Hotel } from '@prisma/client';


// pegando todos os hoteis
async function hotelsGet(): Promise<Hotel[]> {

  const hotels = await prisma.hotel.findMany();
  return hotels;
}

// pegando os quartos do hotel usando o id
async function hotelRoomsGet(hotelId: number) {
    const hotels = await prisma.hotel.findFirst({
      where: {
        id: hotelId,
      },
      include: {
        Rooms: true,
      },
    });

    return hotels;
  }

export const hotelsRepository = {
    hotelsGet,
    hotelRoomsGet
};
