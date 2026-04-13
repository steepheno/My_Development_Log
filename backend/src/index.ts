import './config/env.js'; // 다른 import보다 먼저 해야 함
import express, { Request, Response } from 'express';
import cors from 'cors';

import debugRouter from './routes/debug.js';
import checkoutRouter from './routes/checkout.js';
import { errorHandler } from './middleware/errorHandler.js';
import bookSpecsRouter from './routes/bookSpecs.js';

// Express 앱 인스턴스 생성
const app = express();
const PORT = process.env.PORT || 3000;

/*  미들웨어 */
// CORS 허용: 프론트(5173)에서 오는 요청만 받기
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// JSON 바디 파싱: 요청 body의 JSON을 자동으로 객체로 변환
app.use(express.json());

/* 라우트 */
// Health check - 서버가 살아있는지 확인용
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API 라우트
app.use('/api/debug', debugRouter);
app.use('/api/orders', checkoutRouter);
app.use('/api/book-specs', bookSpecsRouter);

/* 에러 핸들링 */
// 404 핸들러 - 정의되지 않은 라우트로 요청이 왔을 때 catch
// Express에서는 모든 라우트 정의 후에 와야 함
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// 글로벌 에러 핸들러
app.use(errorHandler);

/* 서버 시작 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.SWEETBOOK_ENV || 'not set'}`);
});
