# AI 스프라이트 QA 에디터 전환 작업 로그

- 시작: 2026-05-14 22:33 KST
- 완료: 2026-05-14 KST
- 목표: `/sprite-editor`를 사람이 직접 픽셀을 찍는 도구가 아니라 AI 생성 프레임을 재생 검수하고 문제 프레임 수정 프롬프트를 만드는 내부 QA 도구로 전환
- 범위:
  - `apps/web/src/app/sprite-editor/page.tsx`
  - `apps/web/src/features/sprite-editor/sprite-frame-editor.tsx`
  - `docs/product/backlog/sprite-frame-qa-editor-20260514.md`

## 구현 결과

- 다중 프레임 업로드, 샘플 프레임 로드, 프레임 목록/상태/필터를 추가했다.
- 재생/정지, 이전/다음, FPS 조절, 하단 타임라인을 추가했다.
- 중앙 프리뷰 캔버스에 onion skin, 중심선, 바닥선, 바운딩 박스 표시를 추가했다.
- 프레임별 `unchecked/pass/needs-fix` 상태, 검수 메모, 순서 이동, 삭제, 교체 흐름을 추가했다.
- 검수 메모와 기준값을 포함한 AI 수정 요청 프롬프트 템플릿 생성/직접 편집/복사를 추가했다.
- 최종 스프라이트시트 PNG와 QA manifest JSON export를 추가했다.

## 검증

- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
