const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        provider: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format the response to match the frontend types
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      providerId: b.providerId,
      providerName: b.provider.name,
      providerAvatar: b.provider.avatar,
      service: b.service,
      date: b.date,
      time: b.time,
      address: b.address,
      price: b.price,
      status: b.status
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { providerId, service, date, time, address, price } = req.body;
    
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        providerId,
        service,
        date,
        time,
        address,
        price,
        status: 'upcoming'
      }
    });
    
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking details (Reschedule or update price)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, price } = req.body;
    
    const dataToUpdate = {};
    if (date) dataToUpdate.date = date;
    if (time) dataToUpdate.time = time;
    if (price !== undefined) dataToUpdate.price = price;

    const booking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update booking details' });
  }
});

// Update booking status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

module.exports = router;
