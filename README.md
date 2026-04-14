# 나의 개발일지
## 1. 서비스 소개


## 2. 실행 방법
* 이 프로젝트는 frontend와 backend가 분리된 구조이며, **백엔드를 먼저 실행**한 후 프론트엔드를 실행해야 합니다.
* 아래 명령어는 모두 git clone 후 **프로젝트 루트에서 시작**하는 기준으로 작성되었습니다.

### 버전
* Node.js 18 이상 버전이 필요합니다.
* [Sweetbook Partner Portal](https://api.sweetbook.com/)에서 발급받은 API Key가 필요합니다. (Sandbox 환경)

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
* 프론트엔드 프로젝트에도 **.env 파일 생성이 필요**합니다.
* `VITE_API_BASE_URL`은 API 요청의 기본 주소로 사용되는 필수 변수이며, 백엔드를 기본 포트(3000)로 실행한 경우 `.env.example`의 기본값을 그대로 사용하시면 됩니다.
* 정상 실행 시 [http://localhost:5173](http://localhost:5173)에서 개발 서버가 구동되며, 접속 시 바로 서비스를 확인할 수 있습니다.
<br/>

## 3. 사용한 API 목록
1권의 포토북을 생성하고 주문하기까지 다음 5개의 API 엔드포인트를 순차 호출합니다.
### 포토북 생성 및 주문
|API|용도|
|:---:|:---:|
|**POST /books**|책 생성|
|**POST /books/{bookUid}/cover**|책 표지 추가|
|**POST /books/{bookUid}/contents**|책 콘텐츠 추가 (60회 반복)|
|**POST /books/{bookUid}/finalization**|책 최종화|
|**POST /orders**|주문 생성|

### 카탈로그 조회
판형 및 템플릿 카탈로그 페이지 구현을 위해 다음의 조회 API를 사용했습니다.
|API|용도|
|:---:|:---:|
|**GET /book-specs**|판형 조회|
|**GET /templates**|템플릿 목록 조회|

## 4. AI 도구 사용 내역
|AI 도구|활용 내용|
|:---|:---|
|**Claude Code**|백엔드(Node.js, Express) 개념 학습, 외부 API 응답 구조 분석, 에러 처리 설계 논의 등 문제 해결 보조|
|**ChatGPT**|실제 수행한 프로젝트 데이터 4개의 형식을 토대로 가상 프로젝트 26개의 Mockup 데이터 생성|
|**GitHub Copilot**|일부 SCSS 스타일 수정(ex. 상위 블록 스타일을 고려한 여백 조정 등)을 위한 보조 용도|

### 활용 내용 상세
**1. 백엔드 기술 개념 이해**
* 백엔드 개발이 처음인 상황에서 백엔드 프로젝트 세팅, 생소한 개념 정리, API 응답 구조 파악, 에러 처리 설계를 위해 Claude Code를 활용했습니다.

**2. 외부 API 응답 구조 분석**
* Sweetbook API 요청 응답 구조 파악을 위해 응답값을 Claude Code와 함께 json 데이터로 저장하고, 에디터 포맷팅 단축키로 구조를 파악했습니다.
* 이를 통해 템플릿마다 응답 데이터 형태가 다름을 직접 파악하여 "개발 일지" 컨셉에 맞는 판형과 템플릿을 선택했습니다.

**3. 에러 처리 전략 논의**
* SSE 스트림(포토북 제작) 도중 서버 연결이 끊어졌을 때와 서버가 꺼져있어 발생하는 에러 메시지가 동일하게 표시되는 문제를 발견했습니다.
* 이는 사용자가 재주문을 시도할 경우, 이중 결제로 이어질 수 있는 중요한 문제라고 판단하여 Claude Code와 해결 방안에 대해 논의했습니다.
* `hasStartedStreaming` 플래그 기반 상태 머신을 도입하여 에러 분류, 메시지 표시, UI 상태 각각의 책임을 분리하도록 직접 설계하고 구현했습니다.
* 이를 통해 스트림 도중 연결이 끊어지면 '다시 주문하지 마시고 고객센터에 문의해주세요.'라는 안내 UI를 띄우도록 하였습니다.

**4. 가상 프로젝트 26개 Mockup data 생성**
* 포토북 생성을 위한 최소 페이지 조건(50페이지 이상)을 맞추기 위해 가상 프로젝트 26개의 데이터를 ChatGPT로 생성했습니다.
* `mockPortfolio.ts`의 처음 4개 프로젝트가 실제로 수행한 프로젝트이며, 나머지는 가상 프로젝트 데이터입니다.

**5. GitHub Copilot으로 스타일 수정 보조**
* 부모 요소를 고려한 스타일 수정, 공통 컴포넌트의 일부 스타일 수정 시 IDE 내에서 맥락을 파악하여 수정하도록 사용했습니다.
* 이를 통해 기존 스타일을 바꾸지 않으면서도 의도한 스타일이 설정되도록 하였습니다.


## 5. 설계 의도
