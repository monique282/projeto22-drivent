import { Address, Enrollment } from '@prisma/client';
import { request } from '@/utils/request';
import { invalidDataError, notFoundError } from '@/errors';
import { addressRepository, CreateAddressParams, enrollmentRepository, CreateEnrollmentParams } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';
import { cepRequestError } from '@/errors/cep-error';

interface Adress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro: boolean;
}

async function addressCepGet(cep: string) {
  // verificando se o cep é valido
  if (!cep || cep === '') {
    throw cepRequestError();
  }

  const result = (await request.get(`${process.env.VIA_CEP_API}/${cep}/json/`)).data as Adress;

  const FilteredAdress = {
    logradouro: result.logradouro,
    complemento: result.complemento,
    bairro: result.bairro,
    cidade: result.localidade,
    uf: result.uf,
  };

  // se der erro
  if (result.erro) {
    throw cepRequestError();
  }

  return FilteredAdress;
}
async function addressAtGet(userId: number): Promise<GetOneWithAddressByUserIdResult> {
  const enrollmentResp = await enrollmentRepository.findAddressById(userId);

  // verificando se a resposta vinda do servidor é valida
  if (!enrollmentResp) {
    throw invalidDataError('Invalid data');
  }

  const [firstAddress] = enrollmentResp.Address;
  const address = tirstAddressGet(firstAddress);

  return {
    ...exclude(enrollmentResp, 'userId', 'createdAt', 'updatedAt', 'Address'),
    ...(!!address && { address }),
  };
}

type GetOneWithAddressByUserIdResult = Omit<Enrollment, 'userId' | 'createdAt' | 'updatedAt'>;

function tirstAddressGet(firstAddress: Address): GetAddressResult {
  // é  valido
  if (!firstAddress) {
    return null;
  }

  return exclude(firstAddress, 'createdAt', 'updatedAt', 'enrollmentId');
}

type GetAddressResult = Omit<Address, 'createdAt' | 'updatedAt' | 'enrollmentId'>;

async function updaCreEnrollmentPost(params: updaCreEnrollmentPost) {
  const enrollment = exclude(params, 'address');
  enrollment.birthday = new Date(enrollment.birthday);
  const address = getAddressForUpsert(params.address);

  // verificando de o cep enviado é valido
  if (!params.address.cep || params.address.cep === '') {
    throw cepRequestError();
  }

  const result = (await request.get(`${process.env.VIA_CEP_API}/${params.address.cep}/json/`)).data as Adress;

  // se der erro
  if (result.erro) {
    throw cepRequestError();
  }

  const newEnrollment = await enrollmentRepository.upsert(params.userId, enrollment, exclude(enrollment, 'userId'));
  await addressRepository.upsert(newEnrollment.id, address, address);
}

function getAddressForUpsert(address: CreateAddressParams) {
  return {
    ...address,
    ...(address?.addressDetail && { addressDetail: address.addressDetail }),
  };
}

export type updaCreEnrollmentPost = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

export const enrollmentsService = {
  addressAtGet,
  updaCreEnrollmentPost,
  addressCepGet,
};
