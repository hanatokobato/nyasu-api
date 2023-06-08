import mongoose, { Types } from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    deck_id: {
      type: Types.ObjectId,
      required: [true, 'Deck is required!'],
    },
    content: {
      type: String,
    },
    attachments: [
      {
        alt: {
          type: String,
        },
        file_url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Card = mongoose.model('Card', cardSchema);

export { Card };
