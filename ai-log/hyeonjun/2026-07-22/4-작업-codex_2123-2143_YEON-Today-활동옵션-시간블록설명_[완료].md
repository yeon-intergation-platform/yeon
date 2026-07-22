# YEON Today 활동 옵션 한국어화

- 시작: 2026-07-22 21:23 KST
- 종료: 2026-07-22 21:43 KST
- 상태: 완료
- 대상: `/today/record` 활동 항목 관리·24시간 타임라인
- 백로그:
  - `docs/product/backlog/2026-07-22-yeon-today-activity-option-korean-labels.md`
  - `docs/product/backlog/2026-07-22-yeon-today-record-slot-notes.md`

## 요청

- 활동 색상과 아이콘 선택 상자의 영문 옵션을 한국어로 표시한다.
- 기록된 시간 블록에 구체적인 설명을 입력하고 블록 하단에서 짧게 확인할 수 있게 한다.

## 확인된 원인

- `ActivityManager`가 색상·아이콘의 서버 계약 토큰을 `<option>` 표시 텍스트로 그대로 렌더링한다.
- 저장값과 표시 라벨의 역할이 분리되지 않아 `blue`, `circle` 같은 내부 값이 사용자 화면에 노출된다.

## 진행 항목

- [x] 화면과 서버 계약값 확인
- [x] 한국어 표시 라벨 적용
- [x] 시간 블록 설명 입력·수정·표시
- [x] 린트·타입 검사·테스트
- [x] 브라우저 기능·시각 검증
- [x] 배포 전 빌드 검증

## 구현 결과

- 색상·아이콘의 서버 계약 토큰은 그대로 유지하고 사용자 표시 라벨만 한국어 매핑으로 분리했다.
- 기존 Spring `note` 필드와 200자 제한을 사용해 별도 저장소나 로컬스토리지를 추가하지 않았다.
- 기록된 시간 블록의 `설명 추가/수정` 버튼에서 인라인 편집기를 열고, 저장된 설명을 블록 하단에 최대 두 줄로 표시한다.
- 활동을 다시 지정할 때 기존 설명을 함께 전송해 설명 유실을 방지했다.
- 시간 블록의 정사각형 비율 강제를 제거해 모바일 4열에서 설명 공간을 확보하고 가로 넘침을 없앴다.

## 검증

- `git diff --check` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `NODE_OPTIONS=--no-experimental-webstorage pnpm --filter @yeon/web test` 통과: 263개 파일, 1,141개 테스트
- `pnpm --filter @yeon/web build` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- Playwright: 한국어 라벨과 원래 계약값, 설명 저장·재표시, 활동 변경 후 설명 유지, 모바일 타임라인 무넘침 검증 통과

## 시각 증거

- `yeon-today-activity-labels-screenshots/before-activity-manager-desktop.png`
- `yeon-today-activity-labels-screenshots/after-activity-manager-desktop.png`
- `yeon-today-activity-labels-screenshots/after-timeline-note-editor-desktop.png`
- `yeon-today-activity-labels-screenshots/after-timeline-note-saved-desktop.png`
- `yeon-today-activity-labels-screenshots/after-timeline-note-mobile.png`
