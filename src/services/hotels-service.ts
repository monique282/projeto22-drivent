

import { notFoundType } from '@/errors';
import { hotelsRepository } from '@/repositories/hotels-repository';

export type HotelsResp = {
    id: number,
    name: string,
    image: string,
    createdAt: Date,
    updatedAt: Date,
};


async function hotelsGet(): Promise<HotelsResp[] | null> {

    const hotels = await hotelsRepository.hotelsGet();

    // verificando se a lista de hotels que veio pelo banco é valida
    if (!hotels) {
        throw notFoundType('Ticket not found');
    };

    // se der tudo certo
    return hotels;
}

export const hotelsService = {
    hotelsGet
};
