import sharp from 'sharp';
import { NextFunction, Request, Response } from 'express';
import { Card } from '../models/card';
import { catchAsync } from '../utils/catchAsync';
import {
  uploadCardPhoto,
  uploadCardAudio,
  CARD_JSON_PARTS,
} from '../utils/upload';
import { Learning } from '../models/learning';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';

// Card routes take the audio as `file` next to the JSON parts, so multer runs
// in `.fields()` mode and the upload lands in req.files rather than req.file.
const uploadedFile = (req: Request) =>
  Array.isArray(req.files) ? undefined : req.files?.file?.[0];

// `content` and `fields` arrive either already parsed (bracket-notation
// fields, or JSON parts a browser marks as files and withJsonParts decodes)
// or as JSON strings from clients that send blob parts without a filename.
const parseJsonField = (name: string, value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new AppError(`${name} must be valid JSON.`, 400);
  }
};

const cardParams = (req: Request) => {
  const allowedFields = ['deck_id', ...CARD_JSON_PARTS];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (!allowedFields.includes(el)) return;
    permittedParams[el] = CARD_JSON_PARTS.includes(el)
      ? parseJsonField(el, req.body[el])
      : req.body[el];
  });
  const file = uploadedFile(req);
  if (file) {
    let filePath;
    if (process.env.NODE_ENV === 'development') {
      const splitedPath = file.path.split('/');
      splitedPath.shift();
      filePath = splitedPath.join('/');
    } else {
      filePath = file.path;
    }
    permittedParams['attachments'] = [
      { alt: file.filename, file_url: filePath },
    ];
  }
  return permittedParams;
};

const getCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.per_page) || 10;
    const skip = (page - 1) * limit;

    const cards = await Card.find({ deck_id: req.query.deck_id })
      .skip(skip)
      .limit(limit);
    const cardCount = await Card.count({ deck_id: req.query.deck_id });

    res.status(200).json({
      success: true,
      data: {
        cards,
        page,
        total_page: Math.ceil(cardCount / limit),
      },
    });
  }
);

const randomCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 3;

    const cards = await Card.aggregate().sample(limit);

    res.status(200).json({
      success: true,
      data: {
        cards: cards.map((c) => Card.hydrate(c)),
      },
    });
  }
);

const learningCards = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.query.limit) || 10;

    const learnedCards = await Learning.find({
      deck_id: req.query.deck_id,
      user_id: req.currentUser!.id,
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
      success: true,
      data: {
        cards: cards.map((c) => Card.hydrate(c)),
      },
    });
  }
);

const showCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const card = await Card.findById(req.params.id);
    if (!card) return next(new AppError('Card not found!', 404));

    res.status(200).json({
      success: true,
      data: { card },
    });
  }
);

const createCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const card = await Card.create(cardParams(req));

    res.status(201).json({
      success: true,
      data: { card },
    });
  }
);

const updateCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const card = await Card.findByIdAndUpdate(req.params.id, cardParams(req), {
      new: true,
      runValidators: true,
    });
    if (!card) return next(new AppError('Card not found!', 404));

    res.status(200).json({
      success: true,
      data: { card },
    });
  }
);

const deleteCard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) return next(new AppError('Card not found!', 404));

    res.status(204).end();
  }
);

const uploadImageAttachment = uploadCardPhoto.single('file');
const uploadAudioAttachment = uploadCardAudio.fields([
  { name: 'file', maxCount: 1 },
  ...CARD_JSON_PARTS.map((name) => ({ name, maxCount: 1 })),
]);

const createAttachment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new AppError('No file uploaded!', 400));

    let fileName;
    let fileUrl;
    if (process.env.NODE_ENV === 'development') {
      fileName = `resized-${req.file.filename}`;

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
      success: true,
      data: {
        attachment: {
          name: fileName,
          path: fileUrl,
        },
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
