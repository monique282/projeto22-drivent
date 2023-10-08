import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
    createEnrollmentWithAddress,
    createUser,
    generateCreditCardData,
    createTicketType,
    createTicketPost,
    ticketPost,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { hotelPost } from '../factories/hotels-factory';
import { bookingPost } from '../factories/booking-factory';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
    await init();
    await cleanDb();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {

    //retornar 401, token nao informado 
    it('Return 401, token not provided', async () => {

        const booking = await server.get('/booking');
        expect(booking.status).toBe(httpStatus.UNAUTHORIZED);
    });

    //Retornar 401, token invalido
    it('Return 401, invalid token', async () => {

        // criando token
        const token = faker.lorem.word();

        const booking = await server.get('/booking').set('Authorization', `Bearer ${token}`);
        expect(booking.status).toBe(httpStatus.UNAUTHORIZED);
    });

    //Retorne 401, não há sessão para o token fornecido
    it('Return 401, there is no session for the given token', async () => {

        // cirando um usuaruio
        const user = await createUser();

        // gerando um token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const booking = await server.get('/booking').set('Authorization', `Bearer ${token}`);
        expect(booking.status).toBe(httpStatus.UNAUTHORIZED);
    });

    

    // token valido
    describe('Valid token', () => {

        //Retornar 404, usuário sem reserva
        it('Return 404, user without reservation ', async () => {

            // cirando um usuaruio
            const user = await createUser();

            // gerando um token
            const token = await generateValidToken(user);

            const booking = await server.get('/booking').set('Authorization', `Bearer ${token}`);
            expect(booking.status).toEqual(httpStatus.NOT_FOUND);
        });

        //Retornar 200, e as informações da reserva 
        it('Return 200, and reservation information', async () => {

            // cirando um usuaruio
            const user = await createUser();

            // gerando um token
            const token = await generateValidToken(user);

            // criando uma inscrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await ticketPost(false, true);

            // criando o ticket
            const ticket = await createTicketPost(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            // gerando um body
            const body = { ticketId: ticket.id, cardData: generateCreditCardData() };

            await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);

            // criadno o hotel
            const hotel = await hotelPost(true);

            await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: hotel.Rooms[0].id });

            const booking = await server.get('/booking').set('Authorization', `Bearer ${token}`);
            expect(booking.body).toEqual({
                id: expect.any(Number),
                Room: {
                    id: expect.any(Number),
                    name: expect.any(String),
                    capacity: expect.any(Number),
                    hotelId: expect.any(Number),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
            expect(booking.status).toEqual(httpStatus.OK);
        });
    });
});

describe('POST /booking', () => {

    //Retornar 401, token não informado
    it('Return 401, token not provided', async () => {

        const booking = await server.post('/booking');
        expect(booking.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    //Retornar 401, o token  inválido
    it('Return 401, invalid token', async () => {

        // criando um token
        const token = faker.lorem.word();

        const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
        expect(booking.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    //Retorne 401, não há sessão para o token fornecido
    it('Return 401, there is no session for the given token', async () => {

        // criando usuario
        const user = await createUser();

        // gerando token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
        expect(booking.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    // token valido
    describe('Valid token', () => {

        //Retornar 404, id do quarto não existi
        it('Return 404, room id does not exist ', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando uma inscrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await ticketPost(false, true);

            // criando o tickt
            const ticket = await createTicketPost(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            // gerando um body
            const body = { ticketId: ticket.id, cardData: generateCreditCardData() };

            await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(body);
            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 89474 });
            expect(booking.status).toEqual(httpStatus.NOT_FOUND);
        });

        //Retornar 403, usuário sem inscrição
        it('Return 403, user not signed up', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criadno o hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 403, usuário sem ticket
        it('Return 403, user without ticket', async () => {

            // criando usuario
            const user = await createUser();

            // gerando o token
            const token = await generateValidToken(user);

            // criadno o hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando inscrição com endereço
            await createEnrollmentWithAddress(user);

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 403, quarto com capacidade máxima
        it('Return 403, room with maximum capacity', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            for (let i = 0; i < room.capacity; i++) {
                const user = await createUser();

                await bookingPost(user.id, room.id);
            };

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 403, ticket não pago
        it('Return 403, ticket not paid', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o ticket
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 403, ticket do usuário remoto
        it('Return 403, ticket from remote user', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(true, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);
            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 403, ingresso do usuário não inclui hotel
        it('Return 403, user ticket does not include hotel', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, false);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //retornar 200 e devolva o id da reserva
        it('Return 200 and return the reservation id', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            // gerando um body
            const body2 = { roomId: room.id };
            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body2);

            expect(booking.status).toEqual(httpStatus.OK);
            expect(booking.body).toEqual({ bookingId: expect.any(Number) });
        });
    });
});


describe('PUT /booking:bookingId', () => {

    //Retornar 401, token não informado
    it('Return 401, token not provided', async () => {
        const response = await server.put('/booking/0');
        expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    //Retornar 401, token invalido
    it('Return 401, invalid token', async () => {

        // gerando token
        const token = faker.lorem.word();

        const booking = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
        expect(booking.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    //Retorne 401, não há sessão para o token fornecido
    it('Return 401, there is no session for the given token', async () => {

        // criando usuario
        const user = await createUser();

        // gerando token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const booking = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
        expect(booking.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    // token valido
    describe('Valid token', () => {

        //Retorne 404, quando o id da reserva não existi
        it('Return 404, when the reservation id does not exist', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            //criando a reserva
            await bookingPost(user.id, room.id);

            const booking = await server.put(`/booking/0`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.NOT_FOUND);
        });

        //Retornar 404, quarto não existe
        it('Return 404, room does not exist', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            //criando a reserva
            const bookingResponde = await bookingPost(user.id, room.id);

            const booking = await server
                .put(`/booking/${bookingResponde.id + 1}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ roomId: room.id + 1 });
            expect(booking.status).toEqual(httpStatus.NOT_FOUND);
        });

        //Retornar 403, quarto com capacidade máxima
        it('Return 403, room with maximum capacity', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel1 = await hotelPost(true);
            const room1 = hotel1.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            //criando a reserva
            const bookingResponde = await bookingPost(user.id, room1.id);
            const hotel2 = await hotelPost(true);
            const room2 = hotel2.Rooms[0];
            for (let i = 0; i < room2.capacity; i++) {
                const user = await createUser();
                await bookingPost(user.id, room2.id);
            }
            const booking = await server
                .put(`/booking/${bookingResponde.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ roomId: room2.id });

            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 403,  usuário sem reserva
        it('Return 403, user without reservation', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const room = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            const booking = await server
                .put(`/booking/${1}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ roomId: room.id });
            expect(booking.status).toEqual(httpStatus.FORBIDDEN);
        });

        //Retornar 200, e id da reserva
        it('Return 200, and reservation id', async () => {

            // criando usuario
            const user = await createUser();

            // gerando token
            const token = await generateValidToken(user);

            // criando hotel
            const hotel = await hotelPost(true);
            const firstRoom = hotel.Rooms[0];

            // criando escrição
            const enrollment = await createEnrollmentWithAddress(user);

            // criando o ticketType usando o params
            const ticketType = await createTicketType(false, true);

            // criando o tickt
            await createTicketPost(enrollment.id, ticketType.id, TicketStatus.PAID);

            //criando a reserva
            const bookingResponde = await bookingPost(user.id, firstRoom.id);

            // criando o segundo hotel
            const hotel2 = await hotelPost(true);
            const room2 = hotel2.Rooms[0];

            const booking = await server
                .put(`/booking/${bookingResponde.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ roomId: room2.id });
            expect(booking.status).toEqual(httpStatus.OK);
            expect(booking.body).toEqual({ bookingId: bookingResponde.id });
        });
    });
});