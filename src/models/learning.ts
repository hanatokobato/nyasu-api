import mongoose, { Types } from 'mongoose';

const learningSchema = new mongoose.Schema(
  {
    card_id: {
      type: Types.ObjectId,
    },
    added_at: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Learning = mongoose.model('Learning', learningSchema);

export { Learning };
