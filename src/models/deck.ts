import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Deck = mongoose.model('Deck', deckSchema);

export { Deck };
