import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

interface IErrorResponse {
  success: false;
  errors: {
    message: string;
    field?: string;
  }[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jsonResponse: IErrorResponse = {
    success: false,
    errors: [{ message: err.message }],
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(err.stack);
  }

  res.status(err.statusCode || 500).json(jsonResponse);
};
