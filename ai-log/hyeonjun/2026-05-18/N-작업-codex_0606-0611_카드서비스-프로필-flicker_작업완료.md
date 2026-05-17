# 카드서비스 프로필 flicker 제거 작업

## 목표

- `http://localhost:3000/card-service` 진입 직후 저장 프로필 로드 전 기본 camel 캐릭터가 순간 보이는 현상 제거.

## 확인한 원인

- `useTypingProfile()`은 초기 상태가 `DEFAULT_PROFILE`이며 `DEFAULT_CHARACTER_ID`가 `camel`이다.
- `/card-service` 홈은 `loaded` 값을 analytics에만 쓰고, 프로필 로드 전에도 `TypingProfileCard`를 즉시 렌더한다.
- 저장된 캐릭터가 camel이 아닌 사용자는 localStorage hydrate 전 첫 프레임에서 camel 스프라이트를 볼 수 있다.

## 계획

1. 프로필 hydrate 전에는 캐릭터 스프라이트 없는 placeholder 렌더.
2. 동일 공용 프로필 카드를 쓰는 `/typing-service` 홈도 같은 조건으로 정합성 유지.
3. 웹 lint/typecheck 및 diff 검증.

## 추가 요청

- `/card-service/decks`에서 `/card-service`로 돌아가는 뒤로가기 네비게이션이 없어 추가한다.
- 구현 방향: 브라우저 히스토리 의존 없이 `/card-service` 고정 링크 제공.

## 변경 결과

- `/card-service`와 `/typing-service` 홈에서 프로필 hydrate 완료 전 `TypingProfileCard` 대신 캐릭터 없는 skeleton을 렌더해 기본 camel 노출을 차단했다.
- `/card-service/decks` 상단에 `/card-service`로 이동하는 `← 카드 홈으로` 링크를 추가했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과

## 특이사항

- 최초 typecheck는 stale `.next/dev/types/routes.d.ts` 문법 오류로 실패했고, `apps/web/.next` 제거 후 재검증 통과했다.
