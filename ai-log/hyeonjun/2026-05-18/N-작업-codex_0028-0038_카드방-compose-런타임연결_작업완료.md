# 카드방 compose 런타임 연결 복구 작업 로그

- 시작: 2026-05-18 00:28 KST
- 워크트리: `/home/osuma/coding_stuffs/yeon-3`
- 브랜치: `fix/card-room-compose-runtime`
- 판단: 운영 서버 `.env`에 새 값을 추가하기보다 compose의 race-server service env에 backend 내부 주소와 internal token을 전달한다.

## 수정 내용

- `compose.prod.yml`, `compose.dev.yml`의 race-server에 `SPRING_BOOTSTRAP_BASE_URL=http://backend:8081`, `SPRING_BACKEND_BASE_URL=http://backend:8081`, `SPRING_INTERNAL_TOKEN=${SPRING_INTERNAL_TOKEN}` 전달.
- race-server가 backend healthy 이후 시작되도록 `depends_on.backend.condition=service_healthy` 추가.

## 검증

- `docker compose -f compose.prod.yml config` (필수 env dummy 주입)
- `docker compose -f compose.dev.yml config` (필수 env dummy 주입)
- `git diff --check`
