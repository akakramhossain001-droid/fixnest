const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's saved addresses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add a new address
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, address, lat, lng } = req.body;
    
    if (!title || !address) {
      return res.status(400).json({ error: 'Title and address are required' });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        title,
        address,
        lat,
        lng
      }
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update an address
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, address, lat, lng } = req.body;
    
    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { title, address, lat, lng }
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete an address
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;
