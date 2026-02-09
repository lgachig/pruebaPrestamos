const redis = require('../config/redis'); 
const pool = require('../config/postgres');

/**
 * REPORTE DE PRÉSTAMOS
 * Pattern: Polling / Saturación con Caché
 */
const getLoansReport = async (req, res) => {
    try {
        // 1. Verificar si el middleware de sobrecarga marcó la petición
        if (req.overloaded) {
            const cachedData = await redis.get('loans:report');
            if (cachedData) {
                // Devolvemos un objeto con metadatos para que el docente verifique el uso de caché
                return res.status(200).json({
                    status: "Saturado - Servido desde Caché Redis",
                    data: JSON.parse(cachedData)
                });
            }
        }

        // 2. Estado Normal: Consultar la base de datos PostgreSQL
        const result = await pool.query('SELECT * FROM loans');
        
        // 3. Actualizar la caché en Redis para que esté lista ante una saturación
        await redis.set('loans:report', JSON.stringify(result.rows), 'EX', 60);

        res.status(200).json({
            status: "Normal - Servido desde PostgreSQL",
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * CREACIÓN DE PRÉSTAMO
 * Pattern: Queue / Worker para evitar caídas
 */
const createLoan = async (req, res) => {
    try {
        if (req.overloaded) {
            // Enviar a la cola de Redis para que el worker lo procese luego
            await redis.lpush('loan_queue', JSON.stringify(req.body));
            return res.status(202).json({ 
                status: "Saturado",
                message: 'Petición guardada en cola Redis para procesamiento diferido' 
            });
        }

        // Proceso normal de inserción
        await pool.query(
            'INSERT INTO loans (student_email, equipment_id, quantity) VALUES ($1, $2, $3)',
            [req.body.student_email, req.body.equipment_id, req.body.quantity]
        );

        // Limpiar la caché del reporte al haber datos nuevos
        await redis.del('loans:report');

        res.status(201).json({ status: "Normal", message: 'Préstamo creado en base de datos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    getLoansReport, 
    createLoan 
};