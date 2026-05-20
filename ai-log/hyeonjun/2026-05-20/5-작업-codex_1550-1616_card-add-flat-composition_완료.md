# 카드 추가 모달 시각 압축 작업 로그

## 목표

- 카드 질문/답변이 더 자주 한 화면에 같이 보이도록 실제 DOM 여백과 높이를 줄인다.
- 이중 wrapper, 두꺼운 toolbar, 반복 helper text를 줄인다.

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 진행 업데이트

- Flat composition 백로그 체크리스트를 추가했다.
- 질문/답변 outer wrapper를 제거하고 compact editor shell 하나만 남겼다.
- compact editor header를 shell 내부로 이동했다.
- `EditorContent`의 추가 높이 wrapper를 제거해 DOM 중첩을 줄였다.
- 우측 미리보기는 preview rail 하나 안에 border 없는 flat face section으로 정리했다.
- compact toolbar class를 카드 editor compact 상수 기반으로 정리했다.
- `pnpm --filter @yeon/web lint` 통과.

- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
- `curl -I --max-time 3 http://localhost:3000/`는 200 OK. 다만 덱 경로가 로컬 데이터 로드에 실패해 모달 visual QA는 수행하지 못했다.
- `rg`로 기존 nested wrapper/shadow/CardPreviewSurface 잔존 여부를 확인했다.

## 출하 체크

- 체크리스트 12번은 PR merge 완료 조건으로 표시한다.
