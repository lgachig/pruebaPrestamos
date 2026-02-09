const express = require('express');
const LoanService = require('../services/LoanService');
const router = express.Router();
const loanService = new LoanService();
const redis = require('../config/redis');

router.get('/report', async (req, res) => {
  try {
    const cacheKey = 'loans:report';

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('CACHE HIT');
      return res.json(JSON.parse(cached));
    }

    console.log('CACHE MISS');
    const report = await loanService.getAllLoans(); // o el método que uses

    await redis.setex(cacheKey, 60, JSON.stringify(report));
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, equipment, quantity } = req.body;
    await loanService.loanEquipment(email, equipment, quantity);

    await redis.del('loans:report'); // 👈 CLAVE

    res.json({ message: 'Préstamo realizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/return/:loanId', async (req, res) => {
  try {
    const loanId = parseInt(req.params.loanId);
    const { email } = req.body;
    await loanService.returnEquipment(loanId, email);

    await redis.del('loans:report'); // 👈 CLAVE

    res.json({ message: 'Equipo devuelto correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/equipment', async (req, res) => {
  try {
    const { name, type, quantity } = req.body;
    await loanService.addEquipment(name, type, quantity);

    await redis.del('loans:report');

    res.json({ message: 'Equipo agregado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/equipment/:id', async (req, res) => {
  try {
    await loanService.deleteEquipment(req.params.id);

    await redis.del('loans:report');

    res.json({ message: 'Equipo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;