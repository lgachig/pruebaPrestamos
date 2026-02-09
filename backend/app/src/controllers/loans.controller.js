const redis = require('../config/redis');
const pool = require('../config/postgres');

exports.createLoan = async (req, res) => {
  if (req.overloaded) {
    await redis.lpush(
      'loan_queue',
      JSON.stringify(req.body)
    );

    console.log('SATURADO → guardado en Redis');
    return res.status(202).json({
      message: 'Sistema saturado, guardado en Redis'
    });
  }

  await pool.query(
    'INSERT INTO loans (amount, user_id) VALUES ($1, $2)',
    [req.body.amount, req.body.user_id]
  );

  await redis.del('loans:report');

  console.log('INSERT DB OK');
  res.status(201).json({ message: 'Loan creado' });
};