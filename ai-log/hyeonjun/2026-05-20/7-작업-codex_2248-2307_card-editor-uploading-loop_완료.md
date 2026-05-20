# 카드 에디터 업로드 상태 루프 회귀 작업 로그

## 목표

- 카드 추가 모달에서 `Maximum update depth exceeded`가 반복되는 회귀를 제거한다.
- 기존 카드 추가 UX 수정 사항을 유지한 채 업로드 상태 동기화만 안정화한다.

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `localhost:3001` Playwright 카드 추가 모달 QA

## 구현

- `CardRichMarkdownEditor`에서 `onUploadingChange`를 ref로 보관하고 `isUploading` 변화에만 호출하도록 변경했다.
- 카드 추가 모달과 카드 row inline 편집 부모에서 `uploadingSides` 동일값 갱신을 무시하도록 방어했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `localhost:3001`은 현재 `/home/osuma/coding_stuffs/yeon` main dev server라 브랜치 코드 반영 전이다. PR merge 후 main 동기화 상태에서 Playwright로 최종 확인한다.
