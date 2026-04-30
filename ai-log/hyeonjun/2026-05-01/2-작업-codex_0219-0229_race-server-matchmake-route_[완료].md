# race-server matchmake 라우팅 수정

- 시작: 2026-05-01 02:19:09 KST
- 종료: 2026-05-01 02:29 KST
- 상태: 완료
- 목적: /health 배포 성공 후 Colyseus joinOrCreate가 /matchmake에서 text fallback을 받아 실패하는 문제 수정
- 범위: apps/race-server/src/index.ts, apps/web/src/features/typing-service/use-race-room.ts, apps/web/package.json, pnpm-lock.yaml

## 관찰

- https://race.yeon.world/health 는 200 OK
- colyseus.js joinOrCreate는 response.room undefined로 실패
- 직접 POST /matchmake/joinOrCreate/typing_race_public 결과가 "typing-race room server" text/plain으로 반환됨

## 계획

1. http.Server를 직접 listen하지 않고 Colyseus gameServer.listen을 사용해 기본 matchmake router를 bind하게 변경
2. health endpoint fallback은 유지
3. 로컬 Docker/Colyseus join 검증 후 main 배포


## 수정

- Colyseus `gameServer.listen()`으로 HTTP/WS 서버를 열어 기본 `/matchmake` 라우터가 실제로 응답하게 변경
- `/health`와 `/`는 Colyseus transport의 express hook으로 이동
- 최신 main의 로비/룸 목록 변경과 통합하면서 Colyseus 0.17 호환성을 유지
- 웹 클라이언트를 legacy `colyseus.js@0.16`에서 `@colyseus/sdk@0.17`로 교체

## 검증

- `pnpm --filter @yeon/race-server typecheck` PASS
- `pnpm --filter @yeon/race-server lint` PASS
- `pnpm --filter @yeon/web typecheck` PASS
- `pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web build` PASS
- `docker build -f apps/race-server/Dockerfile -t yeon-race-server-matchmake-fix:test .` PASS
- 로컬 컨테이너 `http://127.0.0.1:2568/health` 200 OK
- 로컬 `/matchmake/joinOrCreate/typing_race_public` JSON seat reservation 반환 확인
- 로컬 `@colyseus/sdk` client quick race `joinOrCreate('typing_race_public', { locale: 'ko' })` 성공
- 로컬 `@colyseus/sdk` client lobby `joinOrCreate('typing_race_public', { locale: 'ko', roomMode: 'lobby' })` 성공

## 배포 메모

- Cloudflare Tunnel route target은 Docker network alias 기준 `http://yeon-prod-race:2567` 유지 필요
- `/health`만으로는 충분하지 않고 실제 `joinOrCreate`까지 확인해야 함
