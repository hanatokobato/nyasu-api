import express from 'express';
import * as decksController from '../controllers/decksController';
import * as authController from './../controllers/authController';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, decksController.getDecks)
  .post(
    authController.protect,
    authController.requireAdmin,
    decksController.uploadDeckPhoto,
    decksController.resizePhoto,
    decksController.createDeck
  );

router
  .route('/:id')
  .get(authController.protect, decksController.showDeck)
  .put(
    authController.protect,
    authController.requireAdmin,
    decksController.uploadDeckPhoto,
    decksController.resizePhoto,
    decksController.updateDeck
  )
  .delete(authController.protect, decksController.deleteDeck);

export { router as decksRouter };
