import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },   // subida gradual
    { duration: '1m', target: 200 },   // saturación
    { duration: '30s', target: 0 },    // bajada
  ],
};

export default function () {
  const res = http.get('http://localhost/');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}