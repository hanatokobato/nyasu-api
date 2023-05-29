import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';

import { decksRouter } from './routes/decks';
import { errorHandler } from './middlewares/error-handler';
import { AppError } from './utils/app-error';
import mongoose from 'mongoose';

const app = express();
app.use(json());

app.use('/api/v1/decks', decksRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start();
