# 나의 개발일지
## 1. 서비스 소개


## 2. 실행 방법
* 이 프로젝트는 frontend와 backend가 분리된 구조이며, **백엔드를 먼저 실행**한 후 프론트엔드를 실행해야 합니다.
* 아래 명령어는 모두 git clone 후 **프로젝트 루트에서 시작**하는 기준으로 작성되었습니다.

### 버전
* Node.js 18 이상 버전이 필요합니다.
* [Sweetbook Partner Portal](https://api.sweetbook.com/)에서 발급받은 API Key (Sandbox 환경)

### 백엔드 실행
``` 
cd backend
npm install
cp .env.example .env

# .env 파일을 열어 SWEETBOOK_API_KEY 값을 본인의 키로 교체

npm run dev
```
<br/>

* 정상 실행 시 터미널에 다음과 같이 표시됩니다.
```
> backend@1.0.0 dev
> tsx watch src/index.ts

◇ injected env (4) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
Environment variables loaded
🚀 Server running on http://localhost:3000
   Environment: sandbox
```

### 프론트엔드 실행
* **새 터미널**을 열고 프로젝트 루트에서 아래 명령어를 실행합니다.
```
cd frontend
npm install
cp .env.example .env
npm run dev
```
* 프론트엔드에도 .env 파일 생성이 필요합니다.
* `VITE_API_BASE_URL`은 API 요청의 기본 주소로 사용되는 필수 변수이며, 백엔드를 기본 포트(3000)로 실행한 경우 `.env.example`의 기본값을 그대로 사용하시면 됩니다.
* 정상 실행 시 [http://localhost:5173](http://localhost:5173)에서 개발 서버가 구동되며, 접속 시 바로 서비스를 확인할 수 있습니다.

## 3. 사용한 API 목록


## 4. AI 도구 사용 내역


## 5. 설계 의도
