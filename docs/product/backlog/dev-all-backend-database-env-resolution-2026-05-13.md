# dev:all Spring 백엔드 DATABASE_URL 해석 보강

## 차수 1

- 작업내용
  - `pnpm dev:all`이 Spring 백엔드를 함께 띄울 때 루트 `.env`에만 의존하지 않고 `apps/backend/.env*`, `apps/web/.env*`의 `DATABASE_URL`도 읽어 로컬 DB 연결값을 전달하도록 보강.
  - 기존 로컬 환경은 `apps/web/.env`에 DB URL이 존재하므로, backend bootRun이 `DATABASE_URL 환경변수가 필요합니다.`로 종료되는 원인을 제거.

- 논의 필요
  - 장기적으로 DB 접속 정보의 공식 위치를 root 또는 backend env로 승격할지 여부.

- 선택지
  - A) dev:all에서 기존 env 배치(`apps/web/.env`)까지 읽어 호환
  - B) 모든 개발자에게 root `.env` 복사를 요구

- 추천
  - A (현재 로컬 환경과 워크트리 공유 규칙을 깨지 않고 즉시 복구)

- 사용자 방향
  - 추천 적용
