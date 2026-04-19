This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 프로젝트 운영 규칙

### 위치 & 소유
- **디바이스**: 막내핑 (채종현의 MacBook Air)
- **경로**: `~/Documents/Development/wedding-invitation/`
- **GitHub**: `treenod-patrick/wedding-invitation` (main 브랜치)
- **Vercel 프로덕션 URL**: https://wedding-invitation-self-gamma.vercel.app
  - Vercel 프로젝트: `jonghyun-treenodcoms-projects/wedding-invitation`
  - 동일 URL 유지 — 새 프로젝트를 만들지 말고 기존 프로젝트에 재배포

### 협업 분업 (츄릭핑 ↔ 막내핑)
- 기획/수정은 **츄릭핑 + 막내핑** 둘이 협의해서 진행
- 실제 코드 반영 및 배포는 **막내핑 디바이스**에서만 수행 (프로젝트가 여기에 있음)
- 작업 완료 후 서로 교차 검수

### 게임 섹션 전면 교체 워크플로우
마스터가 게임 항목을 전면적으로 변경할 때의 표준 절차:

1. **기획 합의** — 츄릭핑 + 막내핑이 새 게임 콘셉트/인터랙션 협의
2. **코드 반영** — 막내핑 디바이스의 이 프로젝트 폴더에 직접 수정
3. **로컬 검증** — `npm run dev`로 로컬 확인
4. **커밋 & 푸시** — `main` 브랜치로 푸시 (GitHub: `treenod-patrick/wedding-invitation`)
5. **Vercel 배포** — `vercel --prod`로 기존 프로젝트에 재배포 (URL 동일 유지)
6. **알리아스 확인** — `wedding-invitation-self-gamma.vercel.app`가 최신 배포를 가리키는지 확인

### 배포 명령
```bash
cd ~/Documents/Development/wedding-invitation
vercel --prod
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
