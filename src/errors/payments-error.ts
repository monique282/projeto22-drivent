import { ApplicationError } from '@/protocols';

// erro 402
export function paymentError(message: string): ApplicationError {
  return {
    name: 'PaymentError',
    message,
  };
}