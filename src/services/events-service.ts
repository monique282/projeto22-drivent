import { Event } from '@prisma/client';
import dayjs from 'dayjs';
import { notFoundError } from '@/errors';
import { eventRepository } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

async function eventGet(): Promise<EventGet> {
  // validadno se os eventos vem do jeito certo
  const event = await eventRepository.findFirst();

  // se tiver errado
  if (!event) {
    throw notFoundError();
  }

  return exclude(event, 'createdAt', 'updatedAt');
}

export type EventGet = Omit<Event, 'createdAt' | 'updatedAt'>;

async function validEvent(): Promise<boolean> {
  const event = await eventRepository.findFirst();

  // se tiver errado
  if (!event) {
    return false;
  }

  // se não
  const now = dayjs();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  return now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);
}

export const eventsService = {
  eventGet,
  validEvent,
};
