import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

interface IErrorResponse {
  errors: {
    message: string;
    field?: string;
  }[];
  stack?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let jsonResponse: IErrorResponse = {
    errors: [{ message: err.message }],
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(err.stack);
    jsonResponse = { ...jsonResponse, stack: err.stack };
  }

  res.status(err.statusCode).json(jsonResponse);
};
