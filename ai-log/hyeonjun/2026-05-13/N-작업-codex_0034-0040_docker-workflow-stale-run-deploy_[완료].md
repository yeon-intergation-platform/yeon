# Docker workflow stale run 배포/검증 정합성 수정

## 목표

배포 단계까지 온 stale run은 이미 이미지 push가 끝난 상태이므로 skip하지 않고 배포한다. verify는 stale run을 실패시키지 않고 최신 main run에 검증 책임을 위임한다.

## 구현

- `deploy_production`의 최신 main skip/cancel guard를 제거했다.
- deploy 단계까지 도달한 stale run은 이미 build/push가 끝난 SHA 이미지가 있으므로 해당 태그로 배포한다.
- `verify_latest_completion`은 stale run을 실패시키지 않고 step summary에 최신 main run 검증 위임을 남긴 뒤 성공 종료한다.
- 최신 main run에서만 build/deploy invariant를 강제한다.

## 검증

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 남은 위험

- stale run이 최신 run보다 먼저 배포될 수 있다. 최신 main run이 뒤이어 성공하면 최신 이미지로 다시 덮어쓴다.
