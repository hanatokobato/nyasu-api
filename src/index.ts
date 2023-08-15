import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import morgan from 'morgan';
import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { decksRouter } from './routes/decks';
import { errorHandler } from './middlewares/error-handler';
import { AppError } from './utils/appError';
import mongoose from 'mongoose';
import cors from 'cors';
import { cardsRouter } from './routes/cards';
import { learningRouter } from './routes/learnings';
import { authRouter } from './routes/auth';

const app = express();
app.set('trust proxy', 'loopback');
app.use(express.static('files'));
app.use(morgan('dev'));
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : false,
  })
);
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN?.split(' '),
  })
);

app.use('/api/v1/decks', decksRouter);
app.use('/api/v1/cards', cardsRouter);
app.use('/api/v1/learnings', learningRouter);
app.use('/api/v1/auth', authRouter);

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
