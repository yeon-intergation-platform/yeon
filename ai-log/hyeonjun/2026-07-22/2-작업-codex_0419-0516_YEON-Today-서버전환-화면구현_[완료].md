# YEON Today 서버 전환·화면 구현 작업 로그

- 작업 시간: 2026-07-22 04:19~05:16 KST
- 브랜치: `docs/yeon-today-server-plan-20260722`
- 기준 문서: `docs/product/yeon-today-screen-definition.md`
- 구현 백로그: `docs/product/backlog/2026-07-22-yeon-today-server-redesign.md`
- 디자인 기준: `docs/product/mockups/yeon-today/` 5개 PNG

## 목표와 결과

- Spring/PostgreSQL을 Today 장기 상태의 유일한 원본으로 구현했다.
- 기존 `localStorage` 데이터는 이관하지 않고 저장 키, reader, writer, import 경로를 모두 삭제했다.
- `/today` 할 일 보드 5개 상태와 `/today/record` 24시간 기록 화면을 구현했다.
- localhost Playwright로 기능, 반응형, 접근성, 시각 QA 증거를 남겼다.

## 완료 항목

- [x] 기존 계획, 시안, 현재 `localStorage` 구현, 저장소 경계 확인
- [x] 로컬 데이터 이관 계획을 폐기하고 서버 단일 원본·완전 삭제 cutover로 문서 정정
- [x] Flyway V23/V24와 Spring Controller → Service → Repository 구현
- [x] 공유 Zod 계약, typed API client, 세션 기반 Next BFF 구현
- [x] TanStack Query, URL 날짜 상태, 구 경로 호환 리다이렉트 구현
- [x] 메인·빈·활성·추가·다른 날짜 선택 상태와 반응형 할 일 보드 구현
- [x] 활동 항목 관리, 24개 시간 슬롯, 날짜별 하루 기록 구현
- [x] 저장·수정·이동·삭제·완료·필터·새로고침 영속성 Playwright QA
- [x] lint, typecheck, 테스트, 빌드, SSOT 검사
- [x] commit → push → PR(main) → merge 준비 및 실행

## 서버 단일 원본 결정

- `public.today_tasks`, `public.today_activity_types`, `public.today_activity_slots`가 사용자 Today 상태를 소유한다.
- 브라우저의 기존 `yeon.todo-service.state.v1` 데이터는 의도적으로 폐기한다.
- 이관 테이블, import API, 안내 배너, 이중 쓰기, 임시 adapter를 만들지 않았다.
- 테스트의 `localStorage.getItem(...)` 호출은 저장 기능이 아니라 기존 키가 생성되지 않음을 검증하는 부정 검증이다.

## 검증 증거

- `./gradlew test`: 전체 Spring 테스트 통과
- `./gradlew test --tests '*Today*'`: Today 집중 테스트 통과
- `pnpm --filter @yeon/web test`: 259개 파일, 1,120개 테스트 통과
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/api-contract lint`
- `pnpm --filter @yeon/api-contract typecheck`
- `pnpm --filter @yeon/api-client lint`
- `pnpm --filter @yeon/api-client typecheck`
- `pnpm --filter @yeon/web build`
- `python3 ai-log/hyeonjun/2026-07-22/today_playwright_qa.py`: `PLAYWRIGHT_QA_OK`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
- 제품 코드 정적 검색에서 `localStorage`와 `yeon.todo-service.state.v1` 참조 0건

## Playwright 확인 범위

- 빈 상태 `0 / 0`, 메인 `3 / 7`, 활성 상태 `5 / 8`, 다른 날짜 `1 / 5`
- Today/Inbox/Done 생성, 수정, 날짜 이동, Inbox 이동, 삭제, 완료·완료 취소
- 우선순위 필터와 예상 시간 선택
- 새로고침 후 PostgreSQL 영속성
- `/today`와 `/today/record`의 `date=YYYY-MM-DD` 공유
- 활동 항목과 24시간 슬롯 저장
- 모바일 가로 overflow 없음과 주요 버튼 접근성 이름
- 브라우저 콘솔 오류 없음

## 시각 증거

경로: `ai-log/hyeonjun/2026-07-22/yeon-today-server-redesign-screenshots/`

- `01-empty-desktop.png`
- `02-add-task-desktop.png`
- `03-main-dashboard-desktop.png`
- `04-active-state-desktop.png`
- `05-selected-date-desktop.png`
- `06-record-desktop.png`
- `07-record-mobile.png`
- `08-board-mobile.png`
- `desktop-contact-sheet.png`
- `mobile-contact-sheet.png`

## 후속 범위

- 고급 추천 사유와 정렬 로직
- 상세·월간 통계
- Expo 네이티브 Today UI
- 30분 이하 기록 단위
