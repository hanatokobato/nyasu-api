import fs from 'fs';
import sharp from 'sharp';
import { NextFunction, Request, Response } from 'express';
import { Card } from '../models/card';
import { catchAsync } from '../utils/catchAsync';
import { uploadCardPhoto, uploadCardAudio } from '../utils/upload';
import { Learning } from '../models/learning';
import mongoose from 'mongoose';

const cardParams = (req: Request) => {
  const allowedFields = ['deck_id', 'content', 'fields'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  if (req.file) {
    let filePath;
    if (process.env.NODE_ENV === 'development') {
      const splitedPath = req.file.path.split('/');
      splitedPath.shift();
      filePath = splitedPath.join('/');
    } else {
      filePath = req.file.path;
    }
    permittedParams['attachments'] = [
      { alt: req.file.filename, file_url: filePath },
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
    const cardCount = await Card.count({ deck_id: req.query.deck_id });

    res.status(200).json({
      status: 'success',
      cards,
      page,
      total_page: cardCount / limit,
    });
  }
);

const randomCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 3;

    const cards = await Card.aggregate().sample(limit);

    res.status(200).json({
      status: 'success',
      cards,
    });
  }
);

const learningCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 10;

    const learnedCards = await Learning.find({
      deck_id: req.query.deck_id,
    }).select('card_id -_id');
    const cards = await Card.aggregate([
      {
        $match: {
          $and: [
            {
              deck_id: new mongoose.Types.ObjectId(req.query.deck_id as string),
            },
            {
              _id: {
                $nin: learnedCards.map((c) => c.card_id),
              },
            },
          ],
        },
      },
    ]).sample(limit);

    res.status(200).json({
      status: 'success',
      cards: cards.map((c) => Card.hydrate(c)),
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

const uploadImageAttachment = uploadCardPhoto.single('file');
const uploadAudioAttachment = uploadCardAudio.single('file');

const createAttachment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    let fileName;
    let fileUrl;
    if (process.env.NODE_ENV === 'development') {
      fileName = `resized-${req.file.filename}`;

      if (!fs.existsSync(`files/img/cards`)) {
        fs.mkdirSync(`files/img/cards`, { recursive: true });
      }
      await sharp(req.file.path)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`files/img/cards/${fileName}`);
      fileUrl = `http://localhost:3000/img/cards/${fileName}`;
    } else {
      fileName = req.file.filename;
      fileUrl = req.file.path;
    }

    res.status(201).json({
      status: 'success',
      attachment: {
        name: fileName,
        path: fileUrl,
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
  randomCards,
  learningCards,
};
