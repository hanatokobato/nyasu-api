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
    photo: {
      type: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

deckSchema.virtual('photoUrl').get(function () {
  if (!this.photo) return null;

  return process.env.NODE_ENV === 'production'
    ? this.photo
    : `http://localhost:3000/img/decks/${this.photo}`;
});

const Deck = mongoose.model('Deck', deckSchema);

export { Deck };
