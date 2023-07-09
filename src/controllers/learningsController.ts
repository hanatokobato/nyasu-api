import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Learning } from '../models/learning';

const learningParams = (req: Request) => {
  const allowedFields = ['card_id', 'deck_id'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  return permittedParams;
};

const addLearning = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Learning.create(learningParams(req));

    res.status(201).json({
      status: 'success',
      deck,
    });
  }
);

export { addLearning };
