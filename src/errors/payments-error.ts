import { ApplicationError } from '@/protocols';

export function paymentError(message: string): ApplicationError {
  return {
    name: 'paymentError',
    message,
  };
}