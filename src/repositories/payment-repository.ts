import { Payment } from '@prisma/client';
import { prisma } from '@/config';
import { PaymentBody } from '@/schemas/payments-schemas';
import { PaymentResponse } from '@/services';

async function paymentPost(details: PaymentBody, price: number): Promise<PaymentResponse> {
  const payment = await prisma.payment.create({
    data: {
      ticketId: details.ticketId,
      value: price,
      cardIssuer: details.cardData.issuer,
      cardLastDigits: details.cardData.number.toString().slice(-4),
    },
    select: {
      id: true,
      ticketId: true,
      value: true,
      cardIssuer: true,
      cardLastDigits: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await prisma.ticket.update({
    where: {
      id: details.ticketId,
    },
    data: {
      status: 'PAID',
    },
  });

  return payment;
}

async function paymentGet(tickedId: number): Promise<Payment> {
  const payment = await prisma.payment.findFirst({
    where: {
      ticketId: tickedId,
    },
  });
  return payment;
}

export const paymentRepository = {
  paymentGet,
  paymentPost,
};
