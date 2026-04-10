import dotenv from 'dotenv';

/* .env 파일을 읽어서 process.env에 로드 */
dotenv.config();

/* 필수 환경변수 검증 */
// API_KEY가 없으면 서버 시작 못하도록 방어
const required = ['SWEETBOOK_API_KEY'] as const;

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error('');
  console.error('   .env 파일을 확인해주세요. .env.example을 참고하세요.');
  process.exit(1);  // 비정상 종료
}

console.log('Environment variables loaded');