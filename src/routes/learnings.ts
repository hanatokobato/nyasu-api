import express from 'express';
import * as learningsController from '../controllers/learningsController';

const router = express.Router();

router
  .route('/')
  .post(learningsController.addLearning)
  .get(learningsController.getLearnings)
  .put(learningsController.updateLearnings);

router.route('/reviews').get(learningsController.getReviews);

export { router as learningRouter };
