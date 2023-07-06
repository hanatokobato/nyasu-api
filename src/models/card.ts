import mongoose, { Types } from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    deck_id: {
      type: Types.ObjectId,
      required: [true, 'Deck is required!'],
    },
    content: {
      front: {
        type: String,
        required: true,
      },
      back: {
        type: String,
      },
    },
    fields: {
      word: {
        type: String,
        required: true,
      },
      translate: {
        type: String,
        required: true,
      },
      spelling: {
        type: String,
      },
      example: {
        sentence: {
          type: String,
          required: true,
        },
        translate: {
          type: String,
        },
      },
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

cardSchema.virtual('audioUrl').get(function () {
  if (!this.attachments.length) return null;

  return process.env.NODE_ENV === 'production'
    ? this.attachments[0].file_url
    : `http://localhost:3000/audio/cards/${this.attachments[0].file_url}`;
});

const Card = mongoose.model('Card', cardSchema);

export { Card };
