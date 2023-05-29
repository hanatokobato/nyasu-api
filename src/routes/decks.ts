import express from 'express';

const router = express.Router();

router.get('/api/v1/decks', (req, res, next) => {
  res.send('Decks');
});

export { router as decksRouter };
