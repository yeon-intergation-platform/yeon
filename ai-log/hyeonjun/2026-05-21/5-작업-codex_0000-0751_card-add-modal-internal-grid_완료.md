# 카드 추가 모달 내부 그리드 정렬 복구

## 시작

- 워크트리: `/home/osuma/coding_stuffs/yeon`
- 브랜치: `codex/card-add-modal-internal-grid`
- 기준: `origin/main`

## 목표

- 카드 추가 모달 질문/답변 편집 영역의 라벨, 툴바, 상태, 본문을 내부 grid 축으로 균일 정렬한다.
- 이전에 버려진 UI diff 의도를 main에 다시 반영한다.

## 변경

- compact 에디터 shell을 내부 grid 컨테이너로 복구했다.
- toolbar를 `라벨 / 도구 버튼 / 이미지 상태` 3열 grid로 정렬했다.
- 본문 영역을 `라벨 gutter / 입력 본문` 2열 grid로 정렬해 질문/답변 입력 시작 x축을 맞췄다.
- 표 편집 bar가 있을 때도 toolbar/table/body row가 깨지지 않도록 compact row 구성을 분기했다.

## 검증

- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
