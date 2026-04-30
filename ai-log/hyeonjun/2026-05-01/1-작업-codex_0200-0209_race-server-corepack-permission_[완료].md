# race-server Corepack 권한 수정

- 시작: 2026-05-01 02:00:48 KST
- 상태: 완료
- 목적: prod race-server 컨테이너가 /home/race/.cache/node/corepack 생성 권한 문제로 재시작되는 장애 수정
- 범위: apps/race-server/Dockerfile 중심 최소 변경

## 관찰

원격 prod 로그에서 Corepack이 /home/race/.cache/node/corepack/v1 생성 중 EACCES로 종료됨.

## 계획

1. non-root race 사용자 HOME/cache 디렉터리 생성 및 소유권 부여
2. race-server typecheck 및 Docker 이미지 빌드 검증
3. main-only PR 생성/머지 후 배포 확인

## 변경

- apps/race-server/Dockerfile runner stage에 HOME/COREPACK_HOME을 명시했습니다.
- non-root race 사용자의 home/cache 디렉터리를 생성하고 소유권을 부여했습니다.
- pnpm 10.33.0을 빌드 시점에 Corepack cache에 prepare해서 런타임 다운로드/권한 실패를 방지했습니다.

## 검증

- pnpm --filter @yeon/race-server typecheck: PASS
- pnpm --filter @yeon/race-server lint: PASS
- docker build -f apps/race-server/Dockerfile -t yeon-race-server-corepack-fix:test .: PASS
  - 1차 시도는 registry socket timeout으로 실패, 재시도 후 PASS
- docker run -p 2568:2567 + curl http://127.0.0.1:2568/health: PASS

## 상태

- 완료: 2026-05-01 02:09:14 KST
