# 타자연습 Playwright 실제 이용 QA

- 시작: 2026-06-18 18:21 KST
- 브랜치: `qa/typing-race-playwright-20260618`
- 범위: 타자 서비스 로컬 실사용 흐름 QA, 직접 재현 가능한 UI/접근성/런타임 버그 수정

## 진행 기록

- `yeon-2`에 다른 커뮤니티 작업이 섞이는 것을 확인하고, 새 격리 워크트리 `yeon-typing-qa`로 타자 QA 변경을 분리했다.
- 기존 `yeon-3` race-server(`:2567`)를 재사용하고, 웹은 별도 포트에서 검증한다.
- `typing-service`, `webapp-testing`, `code-quality-principles` 규칙을 확인했다.
- Playwright 재현으로 `/typing-service/practice` hydration mismatch, 방 만들기 모달 `role="dialog"` 누락, 비활성 음성통화 env 문구 노출, BGM 라벨 이상 문구를 확인했다.
- 초기 연습 문장 선택을 deterministic하게 바꿔 hydration mismatch를 제거했다.
- 방 만들기 공유 모달에 `role="dialog"`/`aria-modal`/label 연결을 보강했다.
- 비활성 음성통화 패널이 레이스 화면에 노출되지 않게 숨기고, env var 문구를 제거했다.
- 타자 기본 덱/캐릭터 프레임 읽기 권한 오류는 기본값으로 fallback해 일반 사용자 흐름의 403 응답을 제거했다.
- BGM 버튼 보조 문구를 의미 있는 `배경음`으로 정리했다.

## 검증

- Playwright final: `/typing-service` 홈, 방 생성 모달, 방 생성, 시작, 카운트다운 후 입력까지 통과.
- Playwright final: `/typing-service/practice` pageerror 없음.
- Playwright final: HTTP 401/403/404/500 응답 없음.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/typing-decks/__tests__/spring-route.test.ts` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `git diff --check` 통과.
