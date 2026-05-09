# 차수42 소비자 패키지 버전 정합성 감사
- 생성일시: 2026-05-09T21:43:00+09:00
- 작업내용: `packages/api-contract`/`packages/api-client` 버전과 런타임 소비처(웹/모바일/타입스크립트 패키지)의 의존성을 맞추고 브레이크를 방지한다.
- 논의 필요: 패치 릴리즈 단위로 올릴지, 도메인 단위로 순차 반영할지.
- 선택지:
  1. 안정화 구간 후 일괄 bump
  2. 영향 있는 consumer부터 선반영
- 추천: 영향 API부터 선반영하고 변경 log를 병행 기록
- 사용자 방향: 추천 기준 진행
- 확장 산출:
  - 점검 항목: `package.json` peer/dependency, pnpm lock 변경 로그, 빌드 타입체크
  - 확인 방법: `pnpm -r why @yeon/api-contract`, `pnpm -r exec tsc --noEmit` 대상 모듈
  - 실패 규칙: 타입 에러/실행 빌드 실패 시 API 변경 분리 후 재배포

