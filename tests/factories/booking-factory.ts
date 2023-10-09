import { prisma } from '@/config';

export async function bookingPost(userId: number, roomId: number) {
  const result = await prisma.booking.create({ data: { userId, roomId }, select: { id: true, Room: true } });
  return result;
}
