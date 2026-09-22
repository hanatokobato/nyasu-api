import fs from 'fs';
import sharp from 'sharp';
import { NextFunction, Request, Response } from 'express';
import { Deck, DeckDoc } from '../models/deck';
import { catchAsync } from '../utils/catchAsync';
import { uploadDeckPhoto } from '../utils/upload';
import { AppError } from '../utils/appError';

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

// The deck-detail shape of the OpenAPI spec (swagger/v1 in nyasu).
const deckDetail = (deck: DeckDoc) => ({
  id: deck.id,
  name: deck.name,
  description: deck.description,
  photo_url: deck.photoUrl,
});

const getDecks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.per_page) || 10;
    const skip = (page - 1) * limit;
    const dbQuery = req.query.search?.length
      ? {
          $text: {
            $search: (req.query.search as string) || '*',
          },
        }
      : {};

    const decks = await Deck.find(dbQuery)
      .populate('cards')
      .skip(skip)
      .limit(limit);
    const decksResponse = await Promise.all(
      decks.map(async (deck) => {
        const learningCount = await deck.learningCount(req.currentUser!.id);
        return {
          ...deckDetail(deck),
          has_unlearned_card: deck.cards.length > learningCount,
          created_at: deck.createdAt,
        };
      })
    );
    const deckCount = await Deck.count(dbQuery);

    res.status(200).json({
      success: true,
      data: {
        decks: decksResponse,
        page,
        total_page: Math.ceil(deckCount / limit),
      },
    });
  }
);

const showDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.findById(req.params.id);
    if (!deck) return next(new AppError('Deck not found!', 404));

    res.status(200).json({
      success: true,
      data: { deck: deckDetail(deck) },
    });
  }
);

const createDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.create(deckParams(req));

    res.status(201).json({
      success: true,
      data: { deck: deckDetail(deck) },
    });
  }
);

const updateDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.findByIdAndUpdate(req.params.id, deckParams(req), {
      new: true,
      runValidators: true,
    });
    if (!deck) return next(new AppError('Deck not found!', 404));

    res.status(200).json({
      success: true,
      data: { deck: deckDetail(deck) },
    });
  }
);

const deleteDeck = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deck = await Deck.findByIdAndDelete(req.params.id);
    if (!deck) return next(new AppError('Deck not found!', 404));

    res.status(204).end();
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

const uploadPhoto = uploadDeckPhoto.single('file');

export {
  getDecks,
  showDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  resizePhoto,
  uploadPhoto as uploadDeckPhoto,
};
