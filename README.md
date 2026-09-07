# VELLUNE Admin

VELLUNE 랜딩페이지 인바운드 문의 관리자 대시보드입니다.

랜딩페이지(`vellune-landing`)와 **별도 프로젝트 / 별도 URL** 로 운영합니다.

## Features

- Google Sheets `INQUIRIES` 탭 문의 목록 조회
- **J열 STATUS** 상담 진행 상태 변경 (NEW / CHECKED / REPLIED / COMPLETED)
- **K열 NOTES** 관리자 비고 저장
- 비밀번호 로그인 + JWT 세션

## Sheet Columns

| Column | Field |
|--------|-------|
| A | ID |
| B | DATE |
| C | TYPE |
| D | COMPANY |
| E | NAME |
| F | EMAIL |
| G | PHONE |
| H | MESSAGE |
| I | PRIVACY |
| J | STATUS |
| K | NOTES (비고) |

Google Sheets 1행에 `NOTES` 헤더(K열)를 추가하세요.

## Environment Variables

```env
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
ADMIN_API_SECRET=your-admin-api-secret
ADMIN_PASSWORD=your-admin-login-password
AUTH_SECRET=your-random-jwt-secret
```

## Google Apps Script Setup

1. 기존 VELLUNE Apps Script 코드를 [`../vellune-landing/google-apps-script/Code.gs`](../vellune-landing/google-apps-script/Code.gs) 최신 버전으로 교체
2. **Project Settings → Script properties** 에 추가:
   - `ADMIN_SECRET` = `ADMIN_API_SECRET` 과 동일한 값
3. Web App **새 버전 재배포**

### Admin API

- `GET ?action=list&secret=ADMIN_SECRET` — 문의 목록
- `POST { action: "update", secret, id, status?, notes? }` — 상태/비고 수정

## Getting Started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) or default 3000.

## Deploy

Separate Vercel project recommended:

- Project: `vellune-admin`
- URL example: `https://vellune-admin.vercel.app`

Set all environment variables in Vercel dashboard.
