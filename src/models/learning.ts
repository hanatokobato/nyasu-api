import mongoose, { Types } from 'mongoose';
import { AppError } from '../utils/app-error';

const learningSchema = new mongoose.Schema(
  {
    user_id: {
      type: Types.ObjectId,
      required: true,
    },
    card_id: {
      type: Types.ObjectId,
      required: true,
    },
    deck_id: {
      type: Types.ObjectId,
    },
    added_at: {
      type: Date,
    },
    last_reviewed_at: {
      type: Date,
    },
    next_review_at: {
      type: Date,
    },
    remember_times: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

learningSchema.pre('validate', function (next) {
  if (this.card_id || this.deck_id) return next();

  next(new AppError('Must provide Card ID or Deck ID', 403));
});

learningSchema.virtual('card', {
  ref: 'Card',
  foreignField: '_id',
  localField: 'card_id',
  justOne: true,
});

learningSchema.index({ user_id: 1, card_id: 1 }, { unique: true });

const Learning = mongoose.model('Learning', learningSchema);

export { Learning };
