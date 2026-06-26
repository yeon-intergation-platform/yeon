# 23차 작업 - 정책/상태머신 보강 8차

## 대상

- 카드 guest/server 저장소 전환 및 merge guest cleanup 정책
- card queryKey web/mobile SSOT 검증
- route-state search params null/blank 경계
- card room Spring BFF error status/code 보존
- race-server card room participant token 요구 경계

## 변경

- web card queryKey adapter가 `@yeon/ui/runtime/ports/card-deck` SSOT를 그대로 재수출하는지 테스트 추가.
- route-state search params의 null/undefined/blank 삭제, false/0 보존, CSV serialize/parse 경계 테스트 추가.
- card room Spring BFF error payload helper를 분리하고 status/code/message 보존 테스트 추가.
- card room participant token의 `SPRING_INTERNAL_TOKEN` 미설정 legacy mode와 설정 시 HMAC 필수 검증 테스트 추가.
- merge guest 결과가 dump snapshot 수와 일치할 때만 로컬 guest deck snapshot을 정리하도록 정책 함수 추가.
- 50개 태스크 장부에서 35, 36, 41, 42, 43, 44, 45번 완료 증거를 갱신.

## 검증

- `pnpm --filter @yeon/web test -- src/features/card-service/card-service-query-keys.test.ts src/features/card-service/hooks/use-merge-guest.test.ts src/lib/route-state/search-params.test.ts src/server/card-rooms-spring-client.test.ts`
  - web Vitest 232개 파일 / 1028개 테스트 통과
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
