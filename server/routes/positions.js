const express = require('express');
const router = express.Router();
const {
  createLongPosition,
  getUserPositions,
  closePosition,
  createShortPosition,
  closeShortPosition,
} = require('../controllers/positionsController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/createLong', authenticate, createLongPosition);
router.post('/createShort', authenticate, createShortPosition);
router.get('/my', authenticate, getUserPositions);
router.post('/closeLong', authenticate, closePosition);
router.post('/closeShort', authenticate, closeShortPosition);

module.exports = router;