# 1 작업 codex code-principle-refactor 55 batch 1 완료

## 목표

- 첨부 원칙 기준 원칙 위반 55개 장부를 만들고 1차 배치(1~12번)를 리팩터링한다.

## 범위

- 커뮤니티 날짜/카테고리 표시 정책
- 타자 서비스 오류 응답/공개 대기방 필터 정책
- 모바일 카드 게스트 opt-in storage fallback

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/features/community/community-date-format.test.ts src/features/typing-service/typing-service-fetch.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`

## 결과

- 완료 태스크: 1~12
- 누적 완료: 12/55
- 상태: 완료.
