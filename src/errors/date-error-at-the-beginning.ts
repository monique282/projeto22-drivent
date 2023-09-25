import { ApplicationError } from '@/protocols';

// esse erro é pra quando na hora da inscrição a data der errado
export function dateErrorAtTheBeginning(): ApplicationError {
  return {
    name: 'dateErrorAtTheBeginning',
    message: 'Cannot enroll before event start date!',
  };
}
