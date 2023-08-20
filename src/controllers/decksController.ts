import fs from 'fs';
import sharp from 'sharp';
import { NextFunction, Request, Response } from 'express';
import { Deck } from '../models/deck';
import { catchAsync } from '../utils/catchAsync';
import { uploadDeckPhoto } from '../utils/upload';

const deckParams = (req: Request) => {
  const allowedFields = ['name', 'description'];
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

    permittedParams['photo'] = filePath;
  }
  return permittedParams;
};

const getDecks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perPage) || 10;
    const skip = (page - 1) * limit;

    const decks = await Deck.find().populate('cards').skip(skip).limit(limit);
    const decksResponse = decks.map((deck) => {
      return {
        ...deck.toObject(),
        hasUnlearnedCard:
          deck.cards.length > deck.learningCount(req.currentUser!.id),
      };
    });

    res.status(200).json({
      status: 'success',
      decks: decksResponse,
      page,
    });
  }
);

const showDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      deck,
    });
  }
);

const createDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.create(deckParams(req));

    res.status(201).json({
      status: 'success',
      deck,
    });
  }
);

const updateDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.findByIdAndUpdate(req.params.id, deckParams(req), {
      new: true,
      runValidators: true,
    });

    res.status(202).json({
      status: 'success',
      deck,
    });
  }
);

const deleteDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
    });
  }
);

const resizePhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file || process.env.NODE_ENV !== 'development') return next();

    req.file.filename = `resized-${req.file.filename}`;

    if (!fs.existsSync(`files/img/decks`)) {
      fs.mkdirSync(`files/img/decks`, { recursive: true });
    }
    await sharp(req.file.path)
      .resize(500, 500)
      .toFile(`files/img/decks/${req.file.filename}`);

    next();
  }
);

const uploadPhoto = uploadDeckPhoto.single('photo');

export {
  getDecks,
  showDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  resizePhoto,
  uploadPhoto as uploadDeckPhoto,
};
