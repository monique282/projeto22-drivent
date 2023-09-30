
import { prisma } from '@/config';

export type HotelsResp = {
    id: number,
    name: string,
    image: string,
    createdAt: Date,
    updatedAt: Date,
};


// pegando todos os hoteis
async function hotelsGet(): Promise<HotelsResp[]| null> {

  const hotels = await prisma.hotel.findMany();
  return hotels as HotelsResp[];
}

// pegando os quartos do hotel usando o if
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
