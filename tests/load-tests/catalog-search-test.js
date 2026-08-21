import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. K6 Test Options
// Define how the load test will run (VUs, duration, thresholds)
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 users over 30s
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 minute
    { duration: '30s', target: 100 }, // Ramp-up to 100 users over 30s
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    // We want 95% of requests to complete within 300ms
    http_req_duration: ['p(95)<300'],
    // We want less than 1% of requests to fail
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

// 2. Mock Data Array for random searches
const searchQueries = [
  '1N4148',
  'LM358',
  'Direnç',
  'Kapasitör',
  'Transistör',
  'Röle',
  'Konnektör'
];

export default function () {
  // Select a random search query
  const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  
  // Make the search API call (simulating PostgreSQL FTS workload)
  const res = http.get(`${BASE_URL}/Katalog/urunler?aramaMetni=${randomQuery}`);
  
  // Check that the request was successful and returned data
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => r.json() && r.json().urunler !== undefined,
  });

  // Wait a short time before making another request to simulate human read time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}
