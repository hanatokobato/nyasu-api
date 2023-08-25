import express from 'express';
import * as cardsController from './../controllers/cardsController';
import * as authController from './../controllers/authController';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, cardsController.getCards)
  .post(
    authController.protect,
    authController.requireAdmin,
    cardsController.uploadAudioAttachment,
    cardsController.createCard
  );

router
  .route('/random')
  .get(authController.protect, cardsController.randomCards);

router
  .route('/learning')
  .get(authController.protect, cardsController.learningCards);

router
  .route('/:id')
  .get(authController.protect, cardsController.showCard)
  .put(
    authController.protect,
    authController.requireAdmin,
    cardsController.uploadAudioAttachment,
    cardsController.updateCard
  )
  .delete(authController.protect, cardsController.deleteCard);

router
  .route('/attachments')
  .post(
    authController.protect,
    authController.requireAdmin,
    cardsController.uploadImageAttachment,
    cardsController.createAttachment
  );

export { router as cardsRouter };
