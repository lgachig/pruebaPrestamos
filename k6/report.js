import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },  // carga normal
    { duration: '10s', target: 50 },  // empieza presión
    { duration: '20s', target: 150 }, // 🔥 SATURACIÓN
    { duration: '10s', target: 20 },  // baja carga
    { duration: '10s', target: 0 },   // descanso
  ],
};

export default function () {
  const url = 'http://localhost/api/loans/report';
  const payload = JSON.stringify({
    amount: Math.floor(Math.random() * 1000),
    user_id: Math.floor(Math.random() * 10) + 1,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status es 201 o 202': (r) => r.status === 201 || r.status === 202,
  });

  sleep(0.1);
}