import Joi from 'joi';
import { getStates, isValidCEP, isValidCPF, isValidMobilePhone } from '@brazilian-utils/brazilian-utils';
import { updaCreEnrollmentPost } from '@/services';


export const createOrUpdateEnrollmentSchema = Joi.object<updaCreEnrollmentPost>({
  name: Joi.string().min(3).required(),
  cpf: Joi.string().length(11).custom(cpfValidation).required(),
  birthday: Joi.string().isoDate().isoDate().required(),
  phone: Joi.string().min(14).max(15).custom(phoneValidation).required(),
  address: Joi.object({
    cep: Joi.string().length(9).custom(cepValidation).required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    number: Joi.string().required(),
    state: Joi.string()
      .length(2)
      .valid(...getStates().map((s) => s.code))
      .required(),
    neighborhood: Joi.string().required(),
    addressDetail: Joi.string().allow(null, ''),
  }).required(),
});

function cpfValidation(value: string, helpers: Joi.CustomHelpers<string>) {
  if (!value) return value;

  if (!isValidCPF(value)) {
    return helpers.error('any.invalid');
  }

  return value;
}

function cepValidation(value: string, helpers: Joi.CustomHelpers<string>) {
  if (!value) return value;

  if (!isValidCEP(value)) {
    return helpers.error('any.invalid');
  }

  return value;
}

function phoneValidation(value: string, helpers: Joi.CustomHelpers<string>) {
  if (!value) return value;

  if (!isValidMobilePhone(value)) {
    return helpers.error('any.invalid');
  }

  return value;
}
