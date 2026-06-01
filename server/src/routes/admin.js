const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to protect admin routes
const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Apply admin middleware to all routes in this file
router.use(adminMiddleware);

// Get Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: 'customer' }
    });
    
    const totalBookings = await prisma.booking.count();
    
    const allBookings = await prisma.booking.findMany({
      select: { price: true }
    });
    const totalRevenue = allBookings.reduce((sum, booking) => sum + booking.price, 0);

    res.json({
      totalUsers,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching bookings' });
  }
});

// Toggle block status
router.put('/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot block admin' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update block status' });
  }
});

module.exports = router;
