import express from 'express';
import * as learningsController from '../controllers/learningsController';

const router = express.Router();

router.route('/').post(learningsController.addLearning);

export { router as learningRouter };
