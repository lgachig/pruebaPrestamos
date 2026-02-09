const LoanService = require('../services/LoanService');
const redis = require('../cache/redis'); 
const loanService = new LoanService();

const getLoansReport = async (req, res) => {
  try {
    if (req.overloaded) {
      const cachedData = await redis.get('last_report');
      if (cachedData) {
        return res.status(200).json({ source: 'Cache (Saturado)', data: JSON.parse(cachedData) });
      }
    }
    const loans = await loanService.getAllLoans();
    await redis.set('last_report', JSON.stringify(loans), 'EX', 60);
    res.status(200).json({ source: 'Database', data: loans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createLoan = async (req, res) => {
  try {
    if (req.overloaded) {
      await redis.lpush('loan_queue', JSON.stringify(req.body));
      return res.status(202).json({ message: 'Encolado por saturación' });
    }
    await loanService.loanEquipment(req.body.student_email, req.body.equipment_id, req.body.quantity);
    res.status(201).json({ message: 'Creado directamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLoansReport, createLoan };