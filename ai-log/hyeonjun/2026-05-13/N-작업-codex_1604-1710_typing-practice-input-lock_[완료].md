### 작업 내역 (2026-05-13)

- 차수: 타자 연습 입력 흐름 안정화
  - 작업내용: 입력값이 정확히 일치한 접두부(`lockedLength`)를 조작 불가 구간으로 하고, 완료 구간 표시 보강. paste/copy/cut 이벤트를 가로막아 타이핑 연습 입력 흐름을 유지.
  - 논의 필요: 없음
  - 선택지: 화면별 분리 적용 / 유틸 공통 적용
  - 추천: 유틸 공통 적용
  - 사용자 방향: 추천 적용
  - 실행 상태: 완료
- 대상 파일:
  - `apps/web/src/features/typing-service/typing-input-utils.ts` (신규)
  - `apps/web/src/features/typing-service/typing-race-solo-screen.tsx`
  - `apps/web/src/features/typing-service/typing-race-multiplayer-screen.tsx`
  - `packages/race-shared/src/typing-race.ts`
- 검증:
  - `pnpm --filter @yeon/web lint`
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - `백로그 생성 문서`: `docs/product/backlog/typing-practice-locked-prefix-input-2026-05-13.md`
- 비고: 기존 측정 흐름(진행률/정확도/속도)은 `prompt`와 `input` 기반으로 유지하고, 입력 경계 보호만 추가.
