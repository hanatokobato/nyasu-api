import express from 'express';
import * as decksController from '../controllers/decksController';

const router = express.Router();

router
  .route('/')
  .get(decksController.getDecks)
  .post(
    decksController.uploadDeckPhoto,
    decksController.resizePhoto,
    decksController.createDeck
  );

router
  .route('/:id')
  .get(decksController.showDeck)
  .put(
    decksController.uploadDeckPhoto,
    decksController.resizePhoto,
    decksController.updateDeck
  )
  .delete(decksController.deleteDeck);

export { router as decksRouter };
