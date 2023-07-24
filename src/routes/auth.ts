import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').delete(authController.logout);

export { router as authRouter };
