# YEON Today 시간 블록 2중 기록

- 시작: 2026-07-22 22:29 KST
- 종료: 2026-07-22 22:47 KST
- 상태: 구현 및 배포 전 검증 완료
- 대상: Spring Today 기록 API·Flyway·공용 계약·웹 하루 기록 타임라인
- 백로그: `docs/product/backlog/2026-07-22-yeon-today-dual-record-slots.md`

## 요청

- 한 시간 블록에 최대 두 개의 활동을 기록한다.
- 첫 클릭 즉시 삽입 흐름을 유지하고 두 번째 클릭으로 두 번째 기록을 추가한다.
- 같은 활동 두 번도 허용하고 각 기록 설명은 독립적으로 관리한다.
- 두 기록은 `/` 방향 사선으로 분할해 표시한다.

## 설계 결정

- 서버가 `entryIndex` 0, 1과 시간당 최대 두 개 불변조건을 소유한다.
- 두 기록일 때 활동별 시간은 각 30분으로 계산한다.
- 응답은 기존 첫 기록 필드와 신규 `entries`를 함께 제공해 배포 호환성을 유지한다.
- 두 기록 블록에서는 각 삼각형 영역을 활동·설명 편집과 개별 삭제 진입점으로 사용한다.

## 진행 항목

- [x] 현행 계약·DB·서버·웹 흐름 확인
- [x] UX와 상태 전이 결정
- [x] Flyway·Spring 저장 모델 구현
- [x] Zod 계약·API 클라이언트 구현
- [x] 사선 분할·독립 설명 UI 구현
- [x] 서버·웹 테스트
- [x] Playwright 기능·시각 검증

## 검증 결과

- Spring: `./gradlew test --tests '*Today*'` 통과
- Spring 패키징: `./gradlew bootJar` 통과
- 계약: API contract lint·typecheck·74개 테스트 통과
- 클라이언트: API client lint·typecheck 통과
- 웹: lint·typecheck·Today 대상 20개 테스트 통과
- 웹 빌드: `pnpm --filter @yeon/web build` 통과
- 브라우저: 같은 활동 2개, 각 항목 활동·설명 수정, 개별 삭제 후 압축, 3번째 추가 UI 차단 확인
- 반응형: 390px 타임라인 가로 넘침 0px
- SSOT: skills sync·project SSOT 검증 통과
- 참고: `spotlessCheck` task는 backend Gradle 프로젝트에 존재하지 않아 실행 불가
- 참고: 웹 전체 Vitest는 기존 `use-import-draft-recovery.test.ts` 3건이 Node의 `localStorage` 미제공 환경에서 실패했으며, 이번 변경 대상 Today 20개 테스트는 별도 실행해 모두 통과

## 시각 근거

- `yeon-today-activity-labels-screenshots/after-timeline-note-desktop.png` — 변경 전 단일 기록 블록
- `yeon-today-dual-record-slots-screenshots/dual-same-activity-desktop.png` — 동일 활동 두 기록
- `yeon-today-dual-record-slots-screenshots/dual-different-activity-desktop.png` — 서로 다른 활동과 설명
- `yeon-today-dual-record-slots-screenshots/dual-entry-editor-desktop.png` — 항목별 활동·설명·삭제 편집기
- `yeon-today-dual-record-slots-screenshots/dual-record-mobile.png` — 390px 사선 분할

## 도구 상태

- `ui-ux-pro-max` 디자인·접근성 검색 완료
- 21st component refiner는 API 키 오류로 사용할 수 없어 기존 YEON Today 컴포넌트 구조를 기준으로 설계
