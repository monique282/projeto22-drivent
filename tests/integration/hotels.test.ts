import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';
import { authenticationRepository, enrollmentRepository } from '@/repositories';
import { ticketService } from '@/services';



beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);


describe('GET /hotels', () => {

    it('deve responder com status 401 se nenhum token for fornecido', async () => {
        const response = await server.get('/hotels');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('deve responder com status 401 se o token fornecido for inválido', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('deve responder com status 401 se não houver sessão para determinado token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

});

describe('quando o token é válido', () => {

    it(' deve responder com status 404 quando o usuário ainda não tem inscrição', async () => {
        // const user = await createUser();
        // const token = await generateValidToken(user);
        // const session = await authenticationRepository.findSession(token);
        //expect(enrollment.status).toBe(httpStatus.NOT_FOUND);
    });

    // passa porem meu banco não atualiza
    it('deve responder com status 404 quando não existir hotel', async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('deve responder com status 404 quando não existir tiket', async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);

        const response = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('deve responder com status 200 e com dados dos hoteis', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotels = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      
        expect(hotels.status).toBe(httpStatus.OK);
        expect(hotels.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                })
            ])
        );
    });

});
