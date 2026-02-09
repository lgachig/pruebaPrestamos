import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // normal
    { duration: '10s', target: 50 },   // presión
    { duration: '20s', target: 150 },  // 🔥 SATURACIÓN
    { duration: '10s', target: 20 },   // baja
    { duration: '10s', target: 0 },    // descanso
  ],
};

export default function () {

  // 🔁 POLLING (lecturas)
  http.get('http://localhost/api/loans/report');

  // ✍️ ESCRITURAS (afectan backend)
  const payload = JSON.stringify({
    amount: Math.floor(Math.random() * 1000),
    user_id: 1,
    student_email: `test${Math.random()}@mail.com`,
    equipment_id: 1,
    quantity: 1
  });

  const res = http.post('http://localhost/api/loans', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    '201 o 202': (r) => r.status === 201 || r.status === 202,
  });

  sleep(0.1);
}