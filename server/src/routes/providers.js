const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all providers
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const providers = await prisma.provider.findMany({
      where: category ? { category: category.toString() } : undefined
    });
    
    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get provider by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.provider.findUnique({ where: { id } });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

module.exports = router;
