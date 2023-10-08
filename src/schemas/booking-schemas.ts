import Joi from 'joi';

export type Booking = {
  roomId: number;
};

export const bookingSchema = Joi.object<Booking>({
  roomId: Joi.number().required(),
});