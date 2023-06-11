import fs from 'fs';
import sharp from 'sharp';
import { NextFunction, Request, Response } from 'express';
import { Deck } from '../models/deck';
import { catchAsync } from '../utils/catchAsync';
import { uploadImage } from '../utils/upload';

const deckParams = (req: Request) => {
  const allowedFields = ['name', 'description'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  if (req.file) {
    permittedParams['photo'] = req.file.filename;
  }
  return permittedParams;
};

const getDecks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perPage) || 10;
    const skip = (page - 1) * limit;

    const decks = await Deck.find().skip(skip).limit(limit);

    res.status(200).json({
      status: 'success',
      decks,
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

const uploadDeckPhoto = uploadImage.single('photo');

export {
  getDecks,
  showDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  resizePhoto,
  uploadDeckPhoto,
};
