import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Learning } from '../models/learning';
import moment from 'moment';

const learningParams = (req: Request) => {
  const allowedFields = ['card_id', 'deck_id'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  return permittedParams;
};

const getLearnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
    });
  }
);

const addLearning = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const added_at = new Date();
    const next_review_at = moment(added_at).add(30, 'm').toDate();
    const deck = await Learning.create({
      ...learningParams(req),
      added_at,
      next_review_at,
    });

    res.status(201).json({
      status: 'success',
      deck,
    });
  }
);

export { addLearning, getLearnings };
