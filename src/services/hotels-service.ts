

import { notFoundType } from '@/errors';
import { enrollmentRepository } from '@/repositories';
import { hotelsRepository } from '@/repositories/hotels-repository';

export type HotelsResp = {
    id: number,
    name: string,
    image: string,
    createdAt: Date,
    updatedAt: Date,
};


async function hotelsGet(): Promise<HotelsResp[] | null> {

    // const enrollment = await enrollmentRepository.findAddressById(userId);

    // // verificando se a inscriçãp do usuario é valido
    // if (!enrollment) {
    //     throw notFoundType('Enrollment not found');
    // }
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
