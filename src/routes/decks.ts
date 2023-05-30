import express from 'express';
import * as decksController from './../controllers/deckController';

const router = express.Router();

router
  .route('/')
  .get(decksController.getDecks)
  .post(decksController.createDeck);

router
  .route('/:id')
  .get(decksController.showDeck)
  .put(decksController.updateDeck)
  .delete(decksController.deleteDeck);

export { router as decksRouter };
