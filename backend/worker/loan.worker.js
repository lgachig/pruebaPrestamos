const redis = require('../app/src/config/redis');
const pool = require('../app/src/config/postgres');

console.log('🟢 Loan Worker iniciado y esperando tareas...');

async function processQueue() {
  while (true) {
    try {
      const data = await redis.rpop('loan_queue');

      if (data) {
        const loan = JSON.parse(data);
        console.log('📥 Procesando loan desde Redis:', loan);

        // Mapeo flexible para que funcione con cualquier formato de entrada
        const email = loan.email || loan.student_email;
        const equipment = loan.equipment || loan.equipment_id;
        const quantity = loan.quantity || 1;

        if (!email || !equipment) {
            console.error('❌ Datos incompletos, saltando tarea...', loan);
            continue;
        }

        await pool.query(
          'INSERT INTO loans (student_email, equipment_id, quantity, loan_date, status) VALUES ($1, $2, $3, CURRENT_DATE, \'ACTIVE\')',
          [email, equipment, quantity]
        );
        
        console.log('✅ Registro insertado en PostgreSQL con éxito');
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error('❌ Error en Worker:', error.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

processQueue();