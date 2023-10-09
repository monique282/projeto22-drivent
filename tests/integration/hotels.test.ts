import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createTicketPost,
  createTicketType,
  createUser,
  generateCreditCardData,
  ticketPost,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { hotelPost } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  //ok
  it('Retornar 401, nenhum token passado', async () => {
    const hotel = await server.get('/hotels');

    expect(hotel.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //ok
  it('Retornar 401, token passado inválido', async () => {
    const token = faker.lorem.word();

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //ok
  it('Retornar 401, não tem sessão para o token fornecido', async () => {
    const user = await createUser();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toBe(httpStatus.UNAUTHORIZED);
  });
});

describe('Token ok', () => {
  it('Retornar 404, usuário sem inscrição', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    await createEnrollmentWithAddress(user);

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('Retornar 404, hotel não existe', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    const enrollmentResponse = await createEnrollmentWithAddress(user);

    const ticketTypeResponse = await ticketPost(false, true);

    const ticket = await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

    const bodyResponde = { ticketId: ticket.id, cardData: generateCreditCardData() };

    await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(bodyResponde);

    const hotel = await server.get(`/hotels`).set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('Retornar 404, não exist tiket referente ao usuario', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    await createEnrollmentWithAddress(user);

    const hotel = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
  });

  it('Retornar 402, ticket ok, mas for remoto', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    const enrollmentResponse = await createEnrollmentWithAddress(user);

    const ticketTypeResponse = await ticketPost(true, true);

    await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('Retornar 402, bilhete existe, mas não tem hotel', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    const enrollmentResponse = await createEnrollmentWithAddress(user);

    const ticketTypeResponse = await ticketPost(false, false);

    await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('Retornar 402, ticket ok, mas não foi pago', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    const enrollmentResponse = await createEnrollmentWithAddress(user);

    const ticketTypeResponse = await createTicketType();

    await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  });

  it('Retornar 200, e os hoteis', async () => {
    const user = await createUser();

    const token = await generateValidToken(user);

    const enrollmentResponse = await createEnrollmentWithAddress(user);

    const ticketTypeResponse = await ticketPost(false, true);

    const ticket = await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

    const bodyResponse = { ticketId: ticket.id, cardData: generateCreditCardData() };

    await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(bodyResponse);

    const createFirsthotel = await hotelPost(false);

    const createSecondhotel = await hotelPost(false);

    const hotels: any = [createFirsthotel, createSecondhotel];

    hotels.forEach(async (hotel: any) => {
      hotel.createdAt = hotel.createdAt.toISOString();

      hotel.updatedAt = hotel.updatedAt.toISOString();
    });

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.body).toHaveLength(2);

    expect(response.status).toBe(httpStatus.OK);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    );
  });
});

describe('GET /hotels/:hotelId', () => {
  it('Retornar 401, token não passado', async () => {
    const hotel = await server.get('/hotels');

    expect(hotel.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Retornar 401, token inválido', async () => {
    const token = faker.lorem.word();

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Retornar 401, sem sessão para o token fornecido', async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(hotel.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('Token ok', () => {
    //ok
    it('Retornar 404 se o hotel com id informado não for valido', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const enrollmentResponse = await createEnrollmentWithAddress(user);

      const ticketTypeResponse = await ticketPost(false, true);

      const ticketResponse = await createTicketPost(
        enrollmentResponse.id,
        ticketTypeResponse.id,
        TicketStatus.RESERVED,
      );

      const bodyResponse = { ticketId: ticketResponse.id, cardData: generateCreditCardData() };

      await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(bodyResponse);

      const hotel = await server.get(`/hotels/324576`).set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
    });

    //ok
    it('Retornar 404, nenhuma inscrição do usuário', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
    });

    //ok
    it('Retornar 404, nenhum ticket do usuário', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      await createEnrollmentWithAddress(user);

      const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
    });

    //ok
    it('Retornar 404, id passado inválido', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const enrollmentResponse = await createEnrollmentWithAddress(user);

      const ticketTypeResponse = await ticketPost(false, true);

      const ticketResponse = await createTicketPost(
        enrollmentResponse.id,
        ticketTypeResponse.id,
        TicketStatus.RESERVED,
      );

      const bodyResponse = { ticketId: ticketResponse.id, cardData: generateCreditCardData() };

      await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(bodyResponse);

      const hotel = await server.get(`/hotels/banana`).set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.NOT_FOUND);
    });

    //ok
    it('Retorna 402, ticket ok, porem remoto', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const enrollmentResponse = await createEnrollmentWithAddress(user);

      const ticketTypeResponse = await ticketPost(true, true);

      await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

      const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    //ok
    it('Retorna 402, bilhete ok mas não tem hotel', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const enrollmentResponse = await createEnrollmentWithAddress(user);

      const ticketTypeResponse = await ticketPost(false, false);

      await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

      const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    //ok
    it('Retorna 402, ticket ok, mas não ta pago', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const enrollmentResponse = await createEnrollmentWithAddress(user);

      const ticketTypeResponse = await createTicketType();

      await createTicketPost(enrollmentResponse.id, ticketTypeResponse.id, TicketStatus.RESERVED);

      const hotel = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('Retorna 200, hotel informado valido, se existir bilhete, ticketi valido, inscrição valida e tudo pago', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);

      const enrollmentResponse = await createEnrollmentWithAddress(user);

      const ticketTypeResponse = await ticketPost(false, true);

      const ticketResponse = await createTicketPost(
        enrollmentResponse.id,
        ticketTypeResponse.id,
        TicketStatus.RESERVED,
      );

      const bodyResponse = { ticketId: ticketResponse.id, cardData: generateCreditCardData() };

      await server.post('/payments/process').set('Authorization', `Bearer ${token}`).send(bodyResponse);

      const crietehotel = await hotelPost(true);

      const hotelConverted: any = crietehotel;

      hotelConverted.createdAt = hotelConverted.createdAt.toISOString();

      hotelConverted.updatedAt = hotelConverted.updatedAt.toISOString();

      hotelConverted.Rooms[0].createdAt = hotelConverted.Rooms[0].createdAt.toISOString();

      hotelConverted.Rooms[0].updatedAt = hotelConverted.Rooms[0].updatedAt.toISOString();

      const hotel = await server.get(`/hotels/${crietehotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(hotel.status).toEqual(httpStatus.OK);

      expect(hotel.body).toEqual(hotelConverted);
    });
  });
});
