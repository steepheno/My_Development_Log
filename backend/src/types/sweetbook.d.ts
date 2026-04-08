// JS SDK에 대한 최소 타입 선언
// TS 컴파일러에게 모듈 존재를 알려주는 용도 (런타임 시 안 쓰임)

declare module '*/lib/index.js' {
  export class SweetbookClient {
    constructor(options: { apiKey: string; environment?: string; baseUrl?: string; timeout?: number });
    books: any;
    photos: any;
    covers: any;
    contents: any;
    orders: any;
    credits: any;
  }
  export class SweetbookApiError extends Error {
    statusCode: number;
    details: any;
  }
  export class SweetbookNetworkError extends Error {}
  export function verifySignature(payload: string, signature: string, secret: string, timestamp: string): boolean;
}
