# 카드 복습 단축키 IME 독립 처리 백로그 (2026-06-17)

## 1차

### 작업내용

- 카드 복습 모드의 스킵 단축키가 한국어 입력 상태에서도 동작하도록 키 판정을 물리 키 기준으로 바꾼다.
- 기존 `s`, `Space`, `1/2/3` 단축키 UX는 유지한다.
- 입력창, 버튼, 링크, contenteditable에서는 기존처럼 전역 단축키가 동작하지 않게 유지한다.

### 논의 필요

- 없음. 사용자는 언어 상태와 무관한 스킵 단축키 동작을 요청했다.

### 선택지

- A. `KeyboardEvent.key` 중심 판정을 유지하고 한국어 문자 후보를 추가한다.
- B. `KeyboardEvent.code`를 우선 사용하고, 기존 브라우저 호환을 위해 `key`를 보조로 둔다.

### 추천

- B. `code`는 입력 언어가 아니라 실제 눌린 물리 키를 표현하므로 IME 상태에 독립적이고, 기존 `key` 보조 판정으로 브라우저 호환성도 유지할 수 있다.

### 사용자 방향

- 추천 기준으로 즉시 진행한다.

## 완료 결과

- 카드 복습 모드 단축키 판정을 `KeyboardEvent.code` 우선으로 분리했다.
- 한국어 입력 상태에서 `KeyS`가 `ㄴ` 같은 `key`로 들어와도 스킵 단축키가 동작한다.
- 기존 영문 `s`, 스페이스, 숫자 `1/2/3` 동작은 보조 `key` 판정으로 유지했다.
- 숫자 채점 단축키는 `Digit1/2/3`와 `Numpad1/2/3` 물리 키도 인식한다.

## 검증

- `pnpm --filter @yeon/web test src/features/card-service/utils/__tests__/card-review-shortcuts.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
