import express from 'express';
import * as learningsController from '../controllers/learningsController';
import { protect } from '../controllers/authController';

const router = express.Router();

router
  .route('/')
  .post(protect, learningsController.addLearning)
  .get(protect, learningsController.getLearnings)
  .put(protect, learningsController.updateLearnings);

router.route('/reviews').get(protect, learningsController.getReviews);

export { router as learningRouter };
