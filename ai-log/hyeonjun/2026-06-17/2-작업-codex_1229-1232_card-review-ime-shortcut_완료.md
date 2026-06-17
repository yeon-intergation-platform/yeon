# 카드 복습 스킵 단축키 IME 독립 처리

## 상태

- 완료

## 범위

- 카드 복습 모드 전역 단축키 판정을 입력 언어와 무관한 물리 키 기준으로 정리한다.
- 계약/API/모바일 동작은 변경하지 않는다.

## 변경

- `KeyboardEvent.key` 중심의 스킵 판정을 `KeyboardEvent.code` 우선 helper로 분리했다.
- 한국어 입력 상태의 `KeyS` 스킵, 기존 영문 `S`, 숫자 채점, 스페이스 정답 공개 단축키를 테스트로 고정했다.

## 검증

- `pnpm --filter @yeon/web test src/features/card-service/utils/__tests__/card-review-shortcuts.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
