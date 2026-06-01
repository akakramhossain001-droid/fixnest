const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get Wallet Balance & Transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
        include: { transactions: true }
      });
    }

    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Add Money to Wallet
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId } });
    }

    const updatedWallet = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } }
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'credit',
          title: 'Added from Bank'
        }
      });

      return updated;
    });

    res.json(updatedWallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add money' });
  }
});

// Deduct Money (For Bookings)
router.post('/deduct', authenticateToken, async (req, res) => {
  try {
    const { amount, serviceTitle } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const updatedWallet = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'debit',
          title: `Paid for ${serviceTitle || 'Service'}`
        }
      });

      return updated;
    });

    res.json(updatedWallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deduct money' });
  }
});

module.exports = router;
