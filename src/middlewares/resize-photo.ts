import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';

export const resizePhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    req.file.filename = `${req.file.originalname}-${Date.now()}.jpeg`;

    if (!fs.existsSync(`files/img/decks`)) {
      fs.mkdirSync(`files/img/decks`, { recursive: true });
    }
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`files/img/decks/${req.file.filename}`);

    next();
  }
);
