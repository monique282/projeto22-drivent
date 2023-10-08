import faker from '@faker-js/faker';
import { prisma } from '@/config';



export async function hotelPost(includeRooms: boolean) {
  return prisma.hotel.create({
    data: {
      image: faker.image.imageUrl(),
      name: faker.name.findName(),
      Rooms: {
        create: {
          capacity: faker.datatype.number({ min: 1, max: 4 }),
          name: faker.name.findName(),
        },
      },
    },
    include: {
      Rooms: includeRooms,
    },
  });
}