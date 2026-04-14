# Voice Diary - 보이스 다이어리

> 바쁜 하루를 보내는 당신을 위한 핸즈프리 다이어리 앱  
> 음성으로 말하면 AI가 분류하고, 노션 + 구글 캘린더에 자동 연동!

## 바로 사용하기

**https://voice-diary-nu.vercel.app**

핸드폰 크롬에서 접속 → 메뉴(⋮) → "홈 화면에 추가" 하면 앱처럼 사용 가능!

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 음성 캡처 | 마이크 버튼 → 말하면 AI가 자동 분류 |
| 불렛 저널 | 할일 관리 (완료/이동/삭제), 시간 알림 |
| 3 Wins 감사일기 | 매일 감사한 일 3가지 기록 |
| 마인드 정크 | 불안/감정 정화 + 셀프 질문 |
| 구글 캘린더 연동 | 시간 있는 할일 → 핸드폰 캘린더 알림 |
| 노션 동기화 | 하루 기록을 노션 데이터베이스에 자동 저장 |
| PWA | 홈 화면에 설치, 오프라인 지원 |

---

## 직접 설치해서 쓰기

### 1. 다운로드

```bash
git clone https://github.com/artsasp/voice-diary.git
cd voice-diary
npm install
```

### 2. 환경변수 설정

프로젝트 폴더에 `.env` 파일을 만들고 아래 내용을 넣어주세요:

```
VITE_CLAUDE_API_KEY=여기에_클로드_API_키
VITE_NOTION_TOKEN=여기에_노션_토큰
VITE_NOTION_DATABASE_ID=여기에_노션_데이터베이스_ID
VITE_GOOGLE_CLIENT_ID=여기에_구글_클라이언트_ID
```

> 환경변수 없이도 기본 기능(불렛저널, 음성인식, 로컬 저장)은 사용 가능합니다!

### 3. 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속하세요.

---

## API 키 발급 방법

### Claude API (AI 분류 기능)
1. https://console.anthropic.com 가입
2. API Keys에서 새 키 생성
3. `.env`의 `VITE_CLAUDE_API_KEY`에 입력
> 없으면 키워드 기반 자동 분류로 동작합니다

### Notion API (자동 동기화)
1. https://www.notion.so/my-integrations 에서 새 통합 만들기
2. 토큰 복사 → `VITE_NOTION_TOKEN`에 입력
3. 노션에서 데이터베이스 만들고 → 통합 연결
4. 데이터베이스 URL에서 ID 복사 → `VITE_NOTION_DATABASE_ID`에 입력

### Google Calendar API (캘린더 연동)
1. https://console.cloud.google.com 에서 프로젝트 생성
2. Google Calendar API 활성화
3. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
4. 클라이언트 ID → `VITE_GOOGLE_CLIENT_ID`에 입력

---

## 기술 스택

- React + Vite
- Tailwind CSS v4
- Web Speech API (음성인식)
- Claude API (AI 분류)
- Notion API (동기화)
- Google Calendar API (캘린더 연동)
- PWA (Service Worker)
- localStorage (로컬 저장)

---

## 화면 구성

```
┌──────────────────────┐
│    오늘의 확언 💜     │
├──────────────────────┤
│    불렛 로그 📋       │
│  • 할일1    ⏰ 14:00  │
│  ✅ 할일2             │
├──────────────────────┤
│    3 Wins 🏆         │
│  1. ___              │
│  2. ___              │
│  3. ___              │
├──────────────────────┤
│  홈  🎤캡처  정크  설정 │
└──────────────────────┘
```

---

## 라이선스

MIT License - 자유롭게 사용하세요!
