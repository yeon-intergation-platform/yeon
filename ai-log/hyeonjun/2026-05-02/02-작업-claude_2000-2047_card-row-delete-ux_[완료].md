---
date: 2026-05-02
time: 2000-2047
agent: claude (worker-1, worker-2, worker-3)
task: card-row-delete-ux
status: 완료
---

# card-row 케밥 메뉴 제거 및 휴지통 아이콘 2-step 삭제 확인 UX

## 작업 요약

`apps/web/src/features/card-service/components/card-row.tsx`에서 기존 케밥 메뉴(⋮) 방식의 삭제 UX를 제거하고, 휴지통 SVG 아이콘 + 2-step 인라인 확인 방식으로 교체했다.

## 변경 내용

- `isDeleteMenuOpen` 상태 제거, ⋮ 버튼 삭제
- 오른쪽 컬럼에 SVG 휴지통 아이콘 버튼 추가
- `isDeleteConfirming` 상태 기반 인라인 취소/삭제 확인 UI로 대체
- 모바일 스와이프 삭제 동작 유지

## 검증

- lint: 통과
- typecheck: 통과

## 팀 구성

- worker-1: card-row.tsx 구현
- worker-1: lint + typecheck 검증
- worker-2: ai-log 작성 + commit + push + PR merge
