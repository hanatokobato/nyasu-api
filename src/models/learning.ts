import mongoose, { Types } from 'mongoose';
import { AppError } from '../utils/app-error';

const learningSchema = new mongoose.Schema(
  {
    card_id: {
      type: Types.ObjectId,
      unique: true,
    },
    deck_id: {
      type: Types.ObjectId,
      unique: true,
    },
    added_at: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

learningSchema.pre('validate', function (next) {
  console.log(this.deck_id);
  if (this.card_id || this.deck_id) return next();

  next(new AppError('Must provide Card ID or Deck ID', 403));
});

const Learning = mongoose.model('Learning', learningSchema);

export { Learning };
