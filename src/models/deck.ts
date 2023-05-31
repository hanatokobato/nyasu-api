import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Deck name is required!'],
      unique: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Deck = mongoose.model('Deck', deckSchema);

export { Deck };
