import express from 'express';
import * as decksController from './../controllers/deckController';
import { resizePhoto } from '../middlewares/resize-photo';

const router = express.Router();

router
  .route('/')
  .get(decksController.getDecks)
  .post(
    decksController.uploadDeckPhoto,
    resizePhoto,
    decksController.createDeck
  );

router
  .route('/:id')
  .get(decksController.showDeck)
  .put(decksController.uploadDeckPhoto, resizePhoto, decksController.updateDeck)
  .delete(decksController.deleteDeck);

export { router as decksRouter };
