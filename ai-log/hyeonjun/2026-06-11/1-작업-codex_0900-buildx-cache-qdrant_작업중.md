# buildx 캐시 정리 및 qdrant 재시작 원인 분석 작업 로그

## 목표

- 운영 호스트 buildx 캐시 145GB를 정리한다.
- 디스크가 꽉 찬 직접/구조 원인을 확인한다.
- Yeon CI/CD가 캐시를 자동 정리하도록 수정한다.
- discord-assistant의 `discord-ai-qdrant` 재시작 루프 원인을 찾아 해결한다.

## 현재 근거

- `ssh.yeon.world` `/` 사용률: 97%, 여유 7.7GB.
- buildx 캐시 합계: web 117GB + backend 12GB + race 17GB.
- buildx 캐시 삭제 후 `/` 사용률: 33%, 여유 153GB.
- Docker 공식 문서: GitHub Actions local cache exporter는 오래된 캐시 엔트리를 자동 삭제하지 않아 move-cache workaround가 필요하다.

## 진행

- buildx local cache 3종 삭제 완료.
- Yeon Docker workflow cache rotate 패치 진행 중.

## Yeon CI 패치

- `.github/workflows/docker-build-web.yml`, `docker-build-backend.yml`, `docker-build-race.yml`에서 ARM64 local buildx cache export 대상을 `*-new` 임시 디렉터리로 변경했다.
- build 성공 후 `index.json`을 확인하고 기존 cache 디렉터리를 새 cache로 교체한다.
- 실패/취소 시 임시 cache 디렉터리를 삭제한다.
- 기존 `docker buildx prune --keep-storage 10GB`가 외부 local exporter 디렉터리를 관리한다는 오해성 주석/스텝명을 정정했다.

## 검증

- `ruby -e "require 'yaml'; ... YAML.load_file(...)"`: workflow 3종 파싱 성공.
- `git diff --check`: 통과.
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`: 통과.
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only`: 통과(exit 0). 단, worktree `.git` 파일 구조 때문에 프로젝트 상세 점검은 스크립트가 건너뜀.
