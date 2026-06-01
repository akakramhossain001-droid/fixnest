const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get reviews for a provider
router.get('/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { providerId },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit a review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { providerId, rating, text } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const review = await prisma.$transaction(async (prisma) => {
      // Create the review
      const newReview = await prisma.review.create({
        data: {
          rating,
          text,
          userId,
          providerId
        }
      });

      // Update provider's overall rating and reviewCount
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { rating: true, reviewCount: true }
      });

      if (provider) {
        const currentTotal = provider.rating * provider.reviewCount;
        const newReviewCount = provider.reviewCount + 1;
        const newRating = (currentTotal + rating) / newReviewCount;

        await prisma.provider.update({
          where: { id: providerId },
          data: {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newReviewCount
          }
        });
      }

      return newReview;
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;
