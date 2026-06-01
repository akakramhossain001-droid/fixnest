const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to generate a unique referral code
const generateReferralCode = (name) => {
  const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
};

// Get current user's info including referral code
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Backfill referral code if missing
    if (!user.referralCode) {
      let code = generateReferralCode(user.name);
      // Ensure uniqueness
      while (await prisma.user.findUnique({ where: { referralCode: code } })) {
        code = generateReferralCode(user.name);
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code }
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      referralCode: user.referralCode,
      referredBy: user.referredBy
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile (phone) and add an address
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    if (name || phone) {
      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;

      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
    }

    if (address) {
      await prisma.address.create({
        data: {
          userId,
          title: 'Home',
          address,
          isDefault: true
        }
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Apply a referral code
router.post('/apply-referral', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) return res.status(400).json({ error: 'Referral code is required' });

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (currentUser.referredBy) {
      return res.status(400).json({ error: 'You have already applied a referral code' });
    }
    if (currentUser.referralCode === code) {
      return res.status(400).json({ error: 'You cannot use your own referral code' });
    }

    const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Apply the referral and credit both wallets
    await prisma.$transaction(async (prisma) => {
      // 1. Update user
      await prisma.user.update({
        where: { id: userId },
        data: { referredBy: referrer.id }
      });

      // 2. Add ₹50 to referrer
      let referrerWallet = await prisma.wallet.findUnique({ where: { userId: referrer.id } });
      if (!referrerWallet) {
        referrerWallet = await prisma.wallet.create({ data: { userId: referrer.id, balance: 0 } });
      }
      await prisma.wallet.update({
        where: { id: referrerWallet.id },
        data: { balance: referrerWallet.balance + 50 }
      });
      await prisma.transaction.create({
        data: {
          walletId: referrerWallet.id,
          amount: 50,
          type: 'credit',
          title: `Referral bonus (from ${currentUser.name})`
        }
      });

      // 3. Add ₹50 to current user
      let currentWallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!currentWallet) {
        currentWallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
      }
      await prisma.wallet.update({
        where: { id: currentWallet.id },
        data: { balance: currentWallet.balance + 50 }
      });
      await prisma.transaction.create({
        data: {
          walletId: currentWallet.id,
          amount: 50,
          type: 'credit',
          title: `Referred by ${referrer.name}`
        }
      });
    });

    res.json({ message: 'Referral applied successfully! ₹50 credited to your wallet.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to apply referral code' });
  }
});

module.exports = router;
