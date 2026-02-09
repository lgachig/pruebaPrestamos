const express = require('express');
const router = express.Router();
const LoanService = require('../services/LoanService');
const loanService = new LoanService();
const redis = require('../config/redis'); 
const overload = require('../middlewares/overload');

/**
 * REPORTE DE PRÉSTAMOS
 * Implementa el patrón de Polling/Caché por saturación
 */
router.get('/report', overload, async (req, res) => {
  try {
    const cacheKey = 'loans:report';

    // 1. Si el sistema está saturado, intentamos servir desde Redis
    if (req.overloaded) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log('🔴 MODO SATURADO: Sirviendo desde Caché');
        return res.json({
          status: "Saturado - Servido desde Caché Redis",
          data: JSON.parse(cached)
        });
      }
    }

    // 2. Si no hay saturación (o no hay caché), vamos a la base de datos
    console.log('🟢 MODO NORMAL: Consultando PostgreSQL');
    const report = await loanService.getAllLoans();

    // 3. Actualizamos la caché para que esté lista ante una futura saturación
    await redis.set(cacheKey, JSON.stringify(report), 'EX', 60);

    res.json({
      status: "Normal - Servido desde PostgreSQL",
      data: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * CREAR PRÉSTAMO
 * Implementa el patrón de Cola (Queue) por saturación
 */
router.post('/', overload, async (req, res) => {
  try {
    // Si el sistema está saturado, encolamos en Redis
    if (req.overloaded) {
      await redis.lpush('loan_queue', JSON.stringify(req.body));
      return res.status(202).json({ 
        status: "Saturado", 
        message: 'Petición encolada en Redis para procesamiento diferido' 
      });
    }

    // Proceso normal
    const { email, equipment, quantity } = req.body;
    await loanService.loanEquipment(email, equipment, quantity);

    // Invalidamos la caché porque los datos cambiaron
    await redis.del('loans:report');

    res.status(201).json({ status: "Normal", message: 'Préstamo realizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DEVOLVER EQUIPO
 */
router.put('/return/:loanId', async (req, res) => {
  try {
    const loanId = parseInt(req.params.loanId);
    const { email } = req.body;
    await loanService.returnEquipment(loanId, email);

    // Invalidamos la caché
    await redis.del('loans:report');

    res.json({ message: 'Equipo devuelto correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * AGREGAR EQUIPO NUEVO
 */
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

/**
 * ELIMINAR EQUIPO
 */
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