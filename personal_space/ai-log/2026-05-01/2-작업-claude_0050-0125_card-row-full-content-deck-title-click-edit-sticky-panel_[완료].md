# 작업-claude | 카드 row 본문 전체 노출 + 덱 제목 클릭 편집 + 선택 카드 패널 sticky 보강

- 주체: Claude CLI (ralph)
- 워크트리: A (/home/osuma/coding_stuffs/yeon)
- 브랜치: feat/card-row-full-content-deck-title-edit-sticky-panel-1
- 작업창(예상): 00:50 ~ 02:00
- 실제 시작: 00:50
- 실제 종료: 01:25
- 상태: 완료

## 파일·디렉토리 범위 (whitelist)
- apps/web/src/features/card-service/components/card-row.tsx
- apps/web/src/features/card-service/components/deck-detail-header.tsx
- apps/web/src/features/card-service/deck-detail-screen.tsx
- .omc/prd.json
- .omc/progress.txt

## 절대 건드리지 않을 범위 (상대 주체 담당)
- 사용자 명시 없는 DB schema/migration 변경
- 카드 서비스 외 도메인 코드
- production 데이터 직접 변경
- Codex 작업 산출물(이미 머지된 PR #168 영역) 회귀 변경

## 상대 주체 현황 스냅샷
- Codex가 2026-05-01 00:21~00:40에 모바일 카드 row 가독성 1차 개선(180자 + line-clamp:2)을 main으로 머지(PR #168)
- 사용자가 “이거 다 보이게 / 제목 클릭 편집 / 선택 카드 섹션 따라오게” 추가 요구

## 차수별 작업내용
1. PRD scaffold를 작업 특화 acceptance criteria로 정제(.omc/prd.json US-001~US-004)
2. US-001 card-row.tsx
   - PREVIEW_MAX_LENGTH/toPreviewText/isExpanded 제거
   - 질문/답변 <p>에 whitespace-pre-wrap break-words 적용
   - 펼치기 ⌄ 버튼 + 별도 펼침 영역 제거(액션 컬럼은 ⋮ 단일 버튼)
   - isDeleteRevealed 안내 문구를 sr-only live region으로 이동(always-mount 패턴, 레이아웃 점프 제거)
3. US-002 deck-detail-header.tsx
   - h1>button 패턴으로 click-to-edit 진입(heading 의미 보존)
   - startEditing 헬퍼: isEditing 가드 + 모바일 메뉴 닫기 + setEditing 통합
   - 모바일 메뉴 ‘덱 편집’과 데스크톱 ✎ 버튼도 startEditing 호출로 통합
4. US-003 deck-detail-screen.tsx
   - aside에 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto 추가(sticky 깨짐 방지 + 내부 스크롤)
   - 100dvh 채택으로 모바일 동적 뷰포트 정확 반영
5. 검증 1회 PASS → architect 1차 REJECTED → CRITICAL/MAJOR/MINOR 수정 → 검증 2회 PASS → architect 2차 APPROVED → ai-slop-cleaner 단순화 → 검증 3회 PASS

## 검증 결과
- pnpm --filter @yeon/web typecheck PASS (exit 0) — 3회 모두 PASS
- pnpm --filter @yeon/web lint PASS (exit 0) — 3회 모두 PASS
- pnpm --filter @yeon/web build PASS (exit 0) — 3회 모두 PASS
- architect 검증 (sonnet) 2차 APPROVED
  - 1차 결함: h1 role=button(WCAG 4.1.2), 100vh stale, isDeleteRevealed 레이아웃 점프
  - 2차 verdict: 모든 결함 PASS, 새 minor 2건은 비차단(live region 패턴, ✎ 버튼 중복)
- ai-slop-cleaner: 단순화로 live region을 always-mount 패턴으로 통일

## 변경 요약
- card-row.tsx: 본문 전체 표시 + dead code 제거 + 안내 문구 sr-only 이동
- deck-detail-header.tsx: 제목 클릭 편집 진입 + heading 의미 보존
- deck-detail-screen.tsx: aside sticky + 100dvh 내부 스크롤

## 남은 리스크 / 후속 작업
- 본문이 매우 긴 카드(2000자 한도)가 다수일 때 카드 목록이 길어짐. 장기적으로 가상 스크롤(react-window 등) 검토 가능.
- 데스크톱 비편집 뷰에 h1>button과 ✎ 버튼이 공존(이중 진입점). 사용자가 단일 진입점을 원하면 ✎ 버튼 제거 가능.
- 이번 변경은 아직 커밋/푸시하지 않음. 사용자 승인 후 ship/PR 진행.

## 산출물
- 변경 코드 3개 파일
- .omc/prd.json (4 스토리 모두 passes:true)
- .omc/progress.txt (학습 내역 포함)
