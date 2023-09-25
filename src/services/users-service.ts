import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { eventsService } from '@/services';
import { dateErrorAtTheBeginning, duplicatedEmailError } from '@/errors';
import { userRepository } from '@/repositories';

export async function createUser({ email, password }: CreateUserParams): Promise<User> {
  await canEnrollOrFail();

  await validateUniqueEmailOrFail(email);

  const hashedPassword = await bcrypt.hash(password, 12);
  return userRepository.create({
    email,
    password: hashedPassword,
  });
}

async function validateUniqueEmailOrFail(email: string) {
  const userWithSameEmail = await userRepository.findByEmail(email);
  if (userWithSameEmail) {
    throw duplicatedEmailError();
  }
}

async function canEnrollOrFail() {
  const canEnroll = await eventsService.validEvent();
  if (!canEnroll) {
    throw dateErrorAtTheBeginning();
  }
}

export type CreateUserParams = Pick<User, 'email' | 'password'>;

export const userService = {
  createUser,
};
