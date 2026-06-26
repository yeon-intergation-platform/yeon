# 작업 로그: 운영 정책·상태머신 보강 batch 1

## 범위

- 새 50개 장부 작성.
- 카드방 상태 판정 SSOT화부터 진행.
- 상담 워크스페이스는 유지보수 동결 정책에 따라 제외.

## 진행

- 현재 브랜치: `codex/policy-state-machine-hardening-50-batch-1`
- 대상 후보: `packages/race-shared/src/card-room.ts`, web/mobile 카드방 화면 상태 훅.
- `race-shared`에 카드방 시작 가능 여부, 현재 카드 공개 여부, 다음 카드 이동 가능 여부, waiting/finished 판정, 현재 참가자 탐색 정책 함수를 추가.
- web/mobile 카드방 화면 훅이 동일한 shared 정책 함수를 사용하도록 리팩터링.
- mobile 카드방에서 `UNASSIGNED` 역할이 확인자처럼 표시되던 fallback을 `미배정` 라벨로 구체화.

## 검증

- `pnpm --filter @yeon/race-shared test -- card-room.test.ts`
- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/race-shared lint`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile lint`
- `git diff --check`
