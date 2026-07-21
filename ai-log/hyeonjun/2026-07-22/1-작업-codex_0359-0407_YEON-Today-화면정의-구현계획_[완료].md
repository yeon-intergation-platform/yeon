# YEON Today 화면 정의 및 서버 기반 구현 계획 문서화

## 목표

- 사용자가 제공한 YEON Today 화면 정의를 반복 참조 가능한 공식 제품 문서로 저장한다.
- 메인, 빈 상태, 활성 사용, 할 일 추가, 날짜 선택 원본 이미지 5개를 저장소에 보존한다.
- 브라우저 `localStorage`가 아니라 Spring 백엔드를 데이터 원본으로 삼는 구현 계획을 백로그로 고정한다.

## 결과

- 화면 정의서에 5개 화면 ID, 공통 컴포넌트, 숫자 의미, 날짜 공유, 반응형, 접근성, 오류 문구를 고정했다.
- 원본 PNG 5개를 `docs/product/mockups/yeon-today/`에 바이트 그대로 보존했다.
- Spring 단일 원본, Flyway 테이블, API/BFF 경계, localStorage 일회성 import, 0~6차 구현 순서를 백로그로 정리했다.
- 기존 localStorage MVP 백로그 3개에 새 서버 기반 SSOT 링크를 추가해 우선순위를 분명히 했다.

## 핵심 결정

- 로그인 사용자 데이터는 Spring/PostgreSQL만 장기 원본으로 사용한다.
- `Today`는 선택 날짜 전체, `Done`은 그중 완료된 부분집합이다.
- 진행률, Done 수, 날짜 요약 완료 수는 하나의 board snapshot에서 일치해야 한다.
- 선택 날짜는 `/today?date=YYYY-MM-DD`와 `/today/record?date=YYYY-MM-DD` 사이에서 공유한다.
- 기존 `yeon.todo-service.state.v1`은 사용자 동의 기반 idempotent import에만 사용하고 운영 이중 쓰기는 금지한다.

## 검증

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- 대상 Markdown `prettier --check` 통과
- 상대 Markdown 링크 존재 검사 통과
- 0~6차별 `작업내용/논의 필요/선택지/추천/사용자 방향/완료 조건` 검사 통과
- Downloads 원본 5개와 저장소 사본 `cmp` 바이트 일치

## 변경 범위

- 실제 기능 코드, DB schema, API, 라우트는 변경하지 않았다.
- 다음 구현은 `docs/product/backlog/2026-07-22-yeon-today-server-redesign.md`의 0차부터 시작한다.
