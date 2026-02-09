const redis = require('../app/src/config/redis');
const pool = require('../app/src/config/postgres');

console.log('🟢 Loan Worker iniciado');

async function processQueue() {
  while (true) {
    const data = await redis.rpop('loan_queue');

    if (data) {
      const loan = JSON.parse(data);
      console.log('📥 Procesando loan desde Redis', loan);

      await pool.query(
        'INSERT INTO loans (student_email, equipment_id, quantity) VALUES ($1,$2,$3)',
        [loan.student_email, loan.equipment_id, loan.quantity]
      );
    } else {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

processQueue();