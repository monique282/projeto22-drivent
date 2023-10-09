import { Enrollment } from '@prisma/client';
import { prisma } from '@/config';

async function findAddressById(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
}

async function registrationWithTicket(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Ticket: {
        include: {
          TicketType: true,
        },
      },
    },
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, 'userId'>;

export const enrollmentRepository = {
  findAddressById,
  upsert,
  registrationWithTicket,
};
