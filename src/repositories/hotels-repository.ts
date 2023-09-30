
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

export const hotelsRepository = {
    hotelsGet
};
