import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { invalidCredentialsError } from '@/errors';
import { authenticationRepository, userRepository } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await userValidationGet(email);

  await validatePassword(password, user.password);

  const token = await createSessionPost(user.id);

  return {
    user: exclude(user, 'password'),
    token,
  };
}

async function userValidationGet(email: string): Promise<UserValidationGetResult> {
  const user = await userRepository.findByEmail(email, { id: true, email: true, password: true });
  if (!user) throw invalidCredentialsError();

  return user;
}

async function createSessionPost(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await authenticationRepository.createSessionPost({
    token,
    userId,
  });

  return token;
}

async function validatePassword(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);

  // se não for valido
  if (!isPasswordValid) {
    throw invalidCredentialsError();
  }
}

export type SignInParams = Pick<User, 'email' | 'password'>;

type SignInResult = {
  user: Pick<User, 'id' | 'email'>;
  token: string;
};

type UserValidationGetResult = Pick<User, 'id' | 'email' | 'password'>;

export const authenticationService = {
  signIn,
};
