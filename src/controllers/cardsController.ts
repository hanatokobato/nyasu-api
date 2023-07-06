import fs from 'fs';
import sharp from 'sharp';
import { NextFunction, Request, Response } from 'express';
import { Card } from '../models/card';
import { catchAsync } from '../utils/catchAsync';
import { uploadImage, uploadAudio } from '../utils/upload';

const cardParams = (req: Request) => {
  const allowedFields = ['deck_id', 'content', 'fields'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  if (req.file) {
    permittedParams['attachments'] = [
      { alt: req.file.filename, file_url: req.file.filename },
    ];
  }
  return permittedParams;
};

const getCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perPage) || 10;
    const skip = (page - 1) * limit;

    const cards = await Card.find({ deck_id: req.query.deck_id })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      cards,
      page,
    });
  }
);

const showCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const card = await Card.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      card,
    });
  }
);

const createCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Card.create(cardParams(req));

    res.status(201).json({
      status: 'success',
      deck,
    });
  }
);

const updateCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Card.findByIdAndUpdate(req.params.id, cardParams(req), {
      new: true,
      runValidators: true,
    });

    res.status(202).json({
      status: 'success',
      deck,
    });
  }
);

const deleteCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Card.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
    });
  }
);

const uploadImageAttachment = uploadImage.single('file');
const uploadAudioAttachment = uploadAudio.single('file');

const createAttachment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    const filename = `${req.file.originalname}-${Date.now()}.jpeg`;

    if (!fs.existsSync(`files/img/cards`)) {
      fs.mkdirSync(`files/img/cards`, { recursive: true });
    }
    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`files/img/cards/${filename}`);

    res.status(201).json({
      status: 'success',
      attachment: {
        name: filename,
        path: `/img/cards/${filename}`,
      },
    });
  }
);

export {
  getCards,
  showCard,
  createCard,
  updateCard,
  deleteCard,
  uploadImageAttachment,
  createAttachment,
  uploadAudioAttachment,
};
