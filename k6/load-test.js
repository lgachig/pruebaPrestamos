import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Normal
    { duration: '10s', target: 50 },   // Presión (Límite del middleware)
    { duration: '20s', target: 150 },  // 🔥 SATURACIÓN activa
    { duration: '10s', target: 20 },   // Recuperación
    { duration: '10s', target: 0 },    // Fin
  ],
};

export default function () {
  const params = { headers: { 'Content-Type': 'application/json' } };

  // 1. Probar POLLING (Lectura de reporte)
  const resGet = http.get('http://localhost/api/loans/report');
  check(resGet, { 'status is 200': (r) => r.status === 200 });

  // 2. Probar ESCRITURA (Creación de préstamo)
  const payload = JSON.stringify({
    email: "ana@mail.com", 
    equipment: 1,          
    quantity: 1
  });

  const resPost = http.post('http://localhost/api/loans', payload, params);

  check(resPost, {
    '201 (DB) o 202 (Redis)': (r) => r.status === 201 || r.status === 202,
  });

  sleep(0.1);
}