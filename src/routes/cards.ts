import express from 'express';
import * as cardsController from './../controllers/cardsController';

const router = express.Router();

router
  .route('/')
  .get(cardsController.getCards)
  .post(cardsController.createCard);

router
  .route('/:id')
  .get(cardsController.showCard)
  .put(cardsController.updateCard)
  .delete(cardsController.deleteCard);

router
  .route('/attachments')
  .post(cardsController.uploadAttachment, cardsController.createAttachment);

export { router as cardsRouter };
