# NEXA support 콘텐츠팩 작업 로그

- 시작: 2026-06-17 14:05 KST
- 종료: 2026-06-17 14:08 KST
- 브랜치: `feat/nexa-support-content-pack-20260617`
- 목적: `support.yeon.world`에 NEXA 검색형 도움말을 추가해 공개 콘텐츠 네트워크 500단계 계획을 계속 실행한다.

## 범위

- NEXA 무료 범위, 서버별 말투, 채널 제외, 봇 제거, 개인정보/대화 데이터, 공지 확인 위치 문서를 추가한다.
- 상담관리 서비스는 제외한다.
- admin 본문 수정/삭제 기능은 추가하지 않는다.

## 근거

- `/Users/osuma/coding_stuffs/discord-assitant/README.md`
- `/Users/osuma/coding_stuffs/discord-assitant/i18n/messages.json`
- `/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_SAFETY_POLICY.md`
- `/Users/osuma/coding_stuffs/discord-assitant/docs/NEXA_USER_FLOWS.md`

## 검증 예정

## 결과

- NEXA support 글 6개를 추가했다.
- 공개 콘텐츠 admin 통계 기대값을 전체 글 수 18개에 맞췄다.
- Next 빌드에서 `/support/[...slug]`가 SSG로 생성되고 `+9 more paths`까지 포함되어 support 총 12개 경로가 확인됐다.

## 검증

- 통과: `pnpm --filter @yeon/web test -- src/features/public-content/public-content-admin-model.test.ts src/lib/__tests__/seo.test.ts` (웹 전체 170 files, 753 tests)
- 통과: `pnpm --filter @yeon/web typecheck`
- 통과: `pnpm --filter @yeon/web lint`
- 통과: `pnpm --filter @yeon/web build`
- 통과: `git diff --check`
- 통과: `bash bin/sync-skills.sh --check`
- 통과: `bash bin/verify-ssot.sh --project-only`
