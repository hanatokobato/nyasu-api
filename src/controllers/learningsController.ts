import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Learning } from '../models/learning';
import moment from 'moment';
import { Card } from '../models/card';
import { shuffle } from 'lodash';

interface ILearningParams {
  card_id?: string;
  deck_id?: string;
}

const learningParams: (req: Request) => ILearningParams = (req: Request) => {
  const allowedFields = ['card_id', 'deck_id'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  return permittedParams;
};

const getLearnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const wordLevels: { [key: string]: number } = {
      level_1: 0,
      level_2: 0,
      level_3: 0,
      level_4: 0,
      level_5: 0,
    };
    Object.keys(wordLevels).forEach(async (level, index) => {
      wordLevels[level] = await Learning.count({
        remember_times: {
          $gt: 10 * index,
          $lte: 10 * (index + 1),
        },
        user_id: req.currentUser!.id,
      });
    });

    const current = new Date();
    const nextOneHour = moment(current).add(1, 'h').toDate();
    const waitReviewCount = await Learning.count({
      next_review_at: {
        $gt: current,
        $lte: nextOneHour,
      },
      user_id: req.currentUser!.id,
    });
    const currReviewCount = await Learning.count({
      next_review_at: {
        $lte: current,
      },
      user_id: req.currentUser!.id,
    });
    const upcoming = await Learning.findOne(
      { user_id: req.currentUser!.id },
      null,
      {
        sort: { next_review_at: 1 },
      }
    );

    res.status(200).json({
      status: 'success',
      word_levels: wordLevels,
      curr_review_count: currReviewCount,
      wait_review_count: waitReviewCount,
      upcoming: upcoming?.next_review_at,
    });
  }
);

const getReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const current = new Date();
    const reviews = await Learning.find({
      next_review_at: {
        $lte: current,
      },
    }).populate('card');

    res.status(200).json({
      status: 'success',
      reviews: shuffle(reviews),
    });
  }
);

const addLearning = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const added_at = new Date();
    const next_review_at = moment(added_at).add(60, 'm').toDate();
    const params = {
      ...learningParams(req),
      added_at,
      next_review_at,
      remember_times: 1,
      user_id: req.currentUser?.id,
    };

    if (params.deck_id && !params.card_id) {
      const cards = await Card.find({ deck_id: params.deck_id });
      const insertData = cards.map((card) => {
        return { ...params, card_id: card._id };
      });
      await Learning.insertMany(insertData, { ordered: false }).catch(
        (e: any) => {}
      );
    } else {
      await Learning.create({
        ...learningParams(req),
        added_at,
        next_review_at,
      });
    }

    res.status(201).json({
      status: 'success',
    });
  }
);

const editLearningsAttributes = async (
  userId: string,
  cardIds: string[],
  isPassed = true
) => {
  const current = new Date();
  const learnings = await Learning.find({
    card_id: {
      $in: cardIds,
    },
    user_id: userId,
  });
  return learnings.map((learning) => {
    learning.last_reviewed_at = current;
    learning.remember_times = isPassed
      ? learning.remember_times + 1
      : learning.remember_times - 1 || 1;
    learning.next_review_at = moment(current)
      .add(60 * learning.remember_times, 'm')
      .toDate();

    return learning;
  });
};

const updateLearnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { passed_cards: passedCards, failed_cards: failedCards } = req.body;
    let editedLearnings: any = [];
    editedLearnings = editedLearnings.concat(
      await editLearningsAttributes(req.currentUser!.id, passedCards, true)
    );
    editedLearnings = editedLearnings.concat(
      await editLearningsAttributes(req.currentUser!.id, failedCards, false)
    );

    await Learning.bulkSave(editedLearnings);

    res.status(204).json({
      status: 'success',
    });
  }
);

export { addLearning, getLearnings, getReviews, updateLearnings };
