// Mock import.meta
(global as any).import = { meta: { env: { VITE_API_URL: 'http://localhost:3000/api' } } };

import { fetchLeetCodeStats } from './src/app/services/api';

async function run() {
  const stats = await fetchLeetCodeStats('CZgnbt0kOm', true);
  console.log('STATS:', JSON.stringify(stats, null, 2));
}
run();
