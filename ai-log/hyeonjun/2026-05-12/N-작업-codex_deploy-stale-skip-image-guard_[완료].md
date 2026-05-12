# deploy stale skip image guard 작업 로그

## 목표
- main 연속 merge 시 오래된 run의 운영 배포를 스킵한다.
- 변경되지 않은 서비스에 현재 SHA 이미지 태그를 강제하지 않아 없는 이미지 pull 실패를 방지한다.

## 제약
- 현재 브랜치에서만 작업한다. 브랜치 전환 금지.
- `.agents/skills/*` 미추적 생성물은 커밋하지 않는다.

## 변경
- `deploy_production`에 최신 main SHA 확인 step을 추가했다.
- 최신 main이 아닌 run은 GHCR 로그인, compose 동기화, pull/up, migration을 모두 스킵한다.
- 변경되지 않은 서비스는 현재 SHA 태그 대신 `latest` 이미지를 사용하도록 배포 env를 분기했다.
- stale deploy run 성공으로 인한 오래된 릴리즈 생성을 막기 위해 auto-release에도 최신 main 확인을 추가했다.

## 검증
- `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/docker-image.yml"); YAML.load_file(".github/workflows/auto-release.yml"); puts "yaml ok"'`
- `git diff --check`
- `bash bin/verify-ssot.sh --project-only`
