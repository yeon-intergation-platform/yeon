# 카드 에디터 Tab 들여쓰기 작업 로그

## 목표

- 카드 추가 rich editor에서 `Tab` 키가 에디터 입력으로 동작하게 한다.
- 질문/답변 및 inline edit에서 같은 공용 동작을 사용한다.

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `localhost:3001` Playwright Tab 입력 확인

## 구현

- `CardRichMarkdownEditor`의 일반 본문 `Tab` keydown에서 기본 포커스 이동을 막고 공백 4칸을 삽입하도록 수정했다.
- 코드블록의 TipTap tab indentation도 4칸으로 맞췄다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `localhost:3001`은 `/home/osuma/coding_stuffs/yeon` main dev server이므로 PR merge 후 main 동기화 상태에서 최종 확인한다.
