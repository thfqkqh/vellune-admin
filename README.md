# VELLUNE Admin

VELLUNE 랜딩페이지 인바운드 문의 관리자 대시보드입니다.

랜딩페이지(`vellune-landing`)와 **별도 프로젝트 / 별도 URL** 로 운영합니다.

## Features

- Supabase `inquiries` 테이블 문의 목록 조회
- **J열 STATUS** 상담 진행 상태 변경 (NEW / CHECKED / REPLIED / COMPLETED)
- **K열 NOTES** 관리자 비고 저장
- 비밀번호 로그인 + JWT 세션

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
AUTH_SECRET=your-random-jwt-secret
```

## Getting Started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

## Deploy

Separate Vercel project: `vellune-admin`  
Production: [https://vellune-admin.vercel.app](https://vellune-admin.vercel.app)
