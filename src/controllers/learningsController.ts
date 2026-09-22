import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Learning } from '../models/learning';
import moment from 'moment';
import { Card, CardDoc } from '../models/card';
import { shuffle } from 'lodash';

interface ILearningParams {
  card_ids?: string[];
  deck_id?: string;
}

const WORD_LEVELS = ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'];

const learningParams: (req: Request) => ILearningParams = (req: Request) => {
  const allowedFields = ['card_ids', 'deck_id'];
  const permittedParams: { [key: string]: any } = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) permittedParams[el] = req.body[el];
  });
  return permittedParams;
};

const getLearnings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser!.id;

    // Level n holds the words remembered between 10(n-1) and 10n times.
    const levelCounts = await Promise.all(
      WORD_LEVELS.map((level, index) =>
        Learning.count({
          remember_times: {
            $gt: 10 * index,
            $lte: 10 * (index + 1),
          },
          user_id: userId,
        })
      )
    );
    const wordLevels: { [key: string]: number } = {};
    WORD_LEVELS.forEach((level, index) => {
      wordLevels[level] = levelCounts[index];
    });

    const current = new Date();
    const nextOneHour = moment(current).add(1, 'h').toDate();
    const waitReviewCount = await Learning.count({
      next_review_at: {
        $gt: current,
        $lte: nextOneHour,
      },
      user_id: userId,
    });
    const currReviewCount = await Learning.count({
      next_review_at: {
        $lte: current,
      },
      user_id: userId,
    });
    const upcoming = await Learning.findOne({ user_id: userId }, null, {
      sort: { next_review_at: 1 },
    });

    res.status(200).json({
      success: true,
      data: {
        word_levels: wordLevels,
        curr_review_count: currReviewCount,
        wait_review_count: waitReviewCount,
        upcoming: upcoming?.next_review_at,
      },
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
      user_id: req.currentUser!.id,
    }).populate<{ card: CardDoc | null }>('card');

    res.status(200).json({
      success: true,
      data: {
        // A learning outlives its card when the card is deleted; skip those.
        cards: shuffle(reviews)
          .map((r) => r.card)
          .filter((card): card is CardDoc => card !== null),
      },
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

    let insertData;
    if (params.deck_id && !params.card_ids) {
      const cards = await Card.find({ deck_id: params.deck_id });
      insertData = cards.map((card) => {
        return { ...params, card_id: card._id };
      });
    } else if (params.card_ids) {
      insertData = params.card_ids.map((cardId) => {
        return { ...params, card_id: cardId };
      });
    }
    await Learning.insertMany(insertData, { ordered: false }).catch(
      (e: any) => {}
    );

    res.status(201).json({
      success: true,
      data: {},
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

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

export { addLearning, getLearnings, getReviews, updateLearnings };
