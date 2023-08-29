import mongoose, { ObjectId } from 'mongoose';
import { Learning } from './learning';
import { CardDoc } from './card';

interface DeckModel extends mongoose.Model<DeckDoc> {}

export interface DeckDoc extends mongoose.Document {
  id: ObjectId;
  name: string;
  description: string;
  photo: string;
  cards: CardDoc[];
  learningCount: (userId: string) => number;
}

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

deckSchema.index({ name: 'text' });

deckSchema.virtual('photoUrl').get(function () {
  if (!this.photo) return null;

  return process.env.NODE_ENV === 'production'
    ? this.photo
    : `http://localhost:3000/${this.photo}`;
});

deckSchema.virtual('learning', {
  ref: 'Learning',
  localField: '_id',
  foreignField: 'deck_id',
  justOne: true,
});

deckSchema.virtual('cards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'deck_id',
});

deckSchema.methods.learningCount = async function (userId: string) {
  return await Learning.count({ deck_id: this.id, user_id: userId });
};

const Deck = mongoose.model<DeckDoc, DeckModel>('Deck', deckSchema);

export { Deck };
