# AI 스프라이트 QA 에디터 Codex handoff 전환 작업 로그

- 시작: 2026-05-15 KST
- 완료: 2026-05-15 KST
- 목표: `/sprite-editor`의 AI 수정 프롬프트 UI를 제거하고 Codex에게 별도 요청하기 좋은 수정 큐/검수 리포트 중심으로 전환
- 범위:
  - `apps/web/src/features/sprite-editor/sprite-frame-editor.tsx`
  - `docs/product/backlog/sprite-frame-qa-codex-handoff-20260515.md`

## 구현 결과

- 사이트 내부의 AI 수정 프롬프트 생성/편집 UI를 제거하고 Codex 수정 큐 리포트로 바꿨다.
- QA JSON export에 `revisionQueue`를 추가해 `needs-fix` 프레임만 Codex handoff 데이터로 분리했다.
- 샘플 시트 분해 로직을 4x4 분할에서 실제 콘텐츠 영역 감지 + 16개 가로 프레임 분할로 수정했다.
- 샘플 이미지의 큰 여백과 체크무늬 배경 때문에 빈 프레임/머리만/다리만 잘리던 문제를 바로잡았다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `pnpm --filter @yeon/web build`
- Playwright MCP 시각 확인은 로컬 XServer 부재로 실행 불가했다.
