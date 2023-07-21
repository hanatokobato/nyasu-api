import express from 'express';
import * as decksController from '../controllers/decksController';
import * as authController from './../controllers/authController';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, decksController.getDecks)
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
