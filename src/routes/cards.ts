import express from 'express';
import * as cardsController from './../controllers/cardsController';
import * as authController from './../controllers/authController';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, cardsController.getCards)
  .post(cardsController.uploadAudioAttachment, cardsController.createCard);

router.route('/random').get(cardsController.randomCards);

router
  .route('/:id')
  .get(cardsController.showCard)
  .put(cardsController.uploadAudioAttachment, cardsController.updateCard)
  .delete(cardsController.deleteCard);

router
  .route('/attachments')
  .post(
    cardsController.uploadImageAttachment,
    cardsController.createAttachment
  );

export { router as cardsRouter };
