import { SweetbookClient } from '../lib/index.js';

const apiKey = process.env.SWEETBOOK_API_KEY;
const environment = process.env.SWEETBOOK_ENV || 'sandbox';

// API Key 없으면 동작하지 않도록 하는 방어 코드
if (!apiKey) {
  throw new Error('SWEETBOOK_API_KEY is not set in .env');
}

// 싱글톤 패턴
export const sweetbook = new SweetbookClient({
  apiKey,
  environment,
});