# 카드 에디터 WYSIWYG 편집 + Markdown 복사 전환

## 시작

- 워크트리: `/home/osuma/coding_stuffs/yeon-4`
- 브랜치: `codex/card-editor-wysiwyg-markdown`
- 기준: `origin/main`

## 진행 내역

- PR #527 merge 상태 확인: merged, `origin/main` 반영 완료.
- `apps/web/README.md` 확인.
- 현재 구현 표면 확인: `CardRichMarkdownEditor`, table utils/edit utils, image extension/upload hook, asset route/client.

## 차수별 계획

- `docs/product/backlog/card-editor-wysiwyg-markdown-20260521.md`의 1~8차 기준으로 순차 진행.

## 구현 완료

- 목록 안 `Tab`/`Shift+Tab`을 하위/상위 목록 이동으로 변경하고, 일반 문단 Tab은 브라우저 기본 동작에 맡김.
- TipTap table/tableRow/tableHeader/tableCell 노드를 도입해 표 삽입·HTML table paste·TSV paste가 실제 표 노드로 들어가게 변경.
- 표 hover/선택 시 오른쪽 `+`는 뒤에 열 추가, 아래 `+`는 아래에 행 추가로 동작하며 tooltip/aria-label을 제공.
- plain text clipboard serializer를 추가해 table/image/list/code/quote/heading을 Markdown 문법으로 복사.
- Notion/HTML table normalizer는 table을 Markdown 문단으로 강제 변환하지 않도록 수정.
- 로컬 Spring `dev.local/local/dev` 또는 `CARD_ASSET_LOCAL_FALLBACK=true`에서 R2 env가 없으면 `~/.yeon/card-assets` 로컬 저장소 fallback을 사용해 Ctrl+V 이미지 업로드 502를 방지.

## 검증

- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web exec vitest run src/features/card-service/components/card-editor-image-utils.test.ts src/features/card-service/components/card-editor-markdown-serializer.test.ts` — 2 files / 7 tests 통과
- `cd apps/backend && ./gradlew test --tests '*CardDeckAsset*'` — 통과
- `git diff --check` — 통과
- `pnpm --filter @yeon/web build` — 통과

## 참고

- `pnpm --filter @yeon/web test -- card-editor-markdown-serializer.test.ts`는 pnpm script 인자 전달 방식 때문에 전체 web test를 실행했고, 기존 seo/oauth/space-template/counseling 테스트 23개가 실패함. 변경 범위 재검증은 `pnpm --filter @yeon/web exec vitest run ...`로 통과 확인.
