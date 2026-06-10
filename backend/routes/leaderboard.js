const express = require('express');
const Score = require('../models/Score');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get top scores
router.get('/top', async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('user', 'username')
      .sort({ score: -1 })
      .limit(10);
    res.json(scores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Submit a new score
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { score, game } = req.body;
    
    const newScore = new Score({
      user: req.user.id,
      score,
      game: game || 'Space Invaders'
    });

    await newScore.save();
    
    const populatedScore = await Score.findById(newScore._id).populate('user', 'username');

    res.json(populatedScore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a score (only owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: 'Score not found' });

    if (score.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this score' });
    }

    await score.remove();
    res.json({ message: 'Score deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
