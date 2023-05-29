import express from 'express';
import { json } from 'body-parser';

import { decksRouter } from './routes/decks';
import { errorHandler } from './middlewares/error-handler';
import { AppError } from './utils/app-error';

const app = express();
app.use(json());

app.use(decksRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});
