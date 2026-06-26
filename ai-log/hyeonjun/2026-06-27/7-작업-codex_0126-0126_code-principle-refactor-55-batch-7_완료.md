# 코드 품질 원칙 위반 리팩터링 55개 - 7차 배치

## 범위

- 태스크 19: 웹 카드 fetch 성공 응답 schema 검증.
- 태스크 20: 웹 카드 room profile parse 실패 fallback 정책 명시.

## 변경

- `cardServiceFetchJson`에 optional response schema 검증을 추가했다.
- 카드 덱 생성/상세/목록, 이미지 업로드, guest merge 응답에 api-contract 스키마를 연결했다.
- 성공 응답이 JSON이 아니거나 계약 shape과 맞지 않으면 `CardServiceApiError`로 사용자용 fallback과 고정 code를 보존한다.
- `use-card-room-profile.ts`가 저장된 profile payload를 `cardRoomProfileSchema.partial()`로 검증하고, malformed/schema-invalid payload는 로깅 후 제거한다.
- fetch/profile 경계 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/card-service/card-service-fetch.test.ts src/features/card-service/hooks/use-card-room-profile.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
