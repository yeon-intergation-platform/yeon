# 운영 런타임 시크릿 무상태 이관 백로그

작성일: 2026-07-11
상태: 실행 중
대상: 운영 배포, web, backend, race-server, PostgreSQL, Cloudflare Tunnel

## 목표

운영 서버의 `/srv/yeon/.env`를 활성 시크릿 저장소로 사용하지 않는다. GitHub `production`
Environment Secrets/Variables를 운영 값의 단일 원천으로 삼고, 런타임 시크릿은 Docker Compose
Secrets로 서비스별 최소 범위에 마운트한다. 기존 `.env`는 복구 백업을 먼저 만든 뒤 새 배포와
재시작 검증이 끝났을 때만 운영 경로에서 제거한다.

## 현재 근거

- 저장소는 public이다. `production` Environment는 custom branch policy로 `main`만 허용한다.
- `main`은 PR 경유, 최신 branch, SSOT check, conversation resolve를 강제하고 force-push와 삭제를
  금지한다.
- 운영 값은 `production` Environment Secrets/Variables에 값 노출 없이 동기화했다. 전환 완료 뒤
  Repository-level 중복 원천은 제거한다.
- 운영 self-hosted runner와 Docker Compose 작업 경로는 `/srv/yeon`이다.
- 2026-07-11 운영 백업을 `/srv/yeon/backups/secret-migration/20260710T171840Z`에 생성했다.
- 백업 디렉터리는 `700`, 백업 파일은 `600`이며 값은 로컬이나 로그로 복사하지 않았다.
- 활성 `/srv/yeon/.env`는 아직 남아 있다. 새 배포와 재시작 검증 전에는 삭제하지 않는다.
- PR, 테스트, lint, typecheck, SSOT 검증은 GitHub-hosted `ubuntu-latest` runner에서 실행한다.
- ARM64 이미지 build/publish는 일회성 GitHub-hosted runner에서 실행하고, 운영 배포만 root 소유
  job-start hook으로 제한된 `yeon-prod` runner에서 실행한다. 과거 `yeon-ci` runner와 OS 계정은
  제거했다.
- Compose v5의 environment-source secret은 컨테이너 생성 시 `/run/secrets` 파일로 전달되고,
  테스트 컨테이너에서 직접 환경변수 없이 `docker restart` 후에도 읽히는 것을 확인했다.
- DB 비밀번호는 `POSTGRES_PASSWORD` 하나만 Environment Secret으로 두고 backend가 비밀이 아닌
  host/port/db/user와 조합한다. 비밀번호가 포함된 `DATABASE_URL` 중복 Secret은 제거한다.
- 운영 앱 이미지는 GHCR tag가 아니라 publish 결과의 `sha256` digest로 고정하도록 배포 계약을
  전환한다.

## 안전 원칙

- 시크릿 값은 Git, 채팅, 로그, command argument, Docker image layer에 남기지 않는다.
- 필수 시크릿 누락은 컨테이너 시작 전에 한국어 오류로 Fail Fast 한다.
- web/backend/race가 공유하는 키는 한 배포에서 원자적으로 전환한다.
- 운영 `.env` 삭제 전 Compose 렌더, 일회성 preflight, 컨테이너 재생성, 실제 health를 모두 확인한다.
- 공개 저장소의 PR 코드를 persistent self-hosted runner에서 실행하지 않는다.
- 운영 runner에서는 정확한 repository/event/ref/workflow 허용 목록을 job step 전에 검사한다.
- 디스크 삭제를 키 폐기와 동일시하지 않는다. 이관 완료 후 별도 키 회전 목록을 남긴다.

## 1차 - 인벤토리와 GitHub 원천 구성

- **작업내용**: 운영 `.env` 키를 시크릿/일반 설정/미사용 후보로 분류하고, GitHub
  `production` Environment Secrets/Variables로 값 노출 없이 이관한다. custom branch policy로
  `main`만 이 Environment를 사용하게 한다.
- **논의 필요**: 일반 설정까지 Environment Variables로 옮길지 Compose 기본값으로 고정할지.
- **선택지**: (a) 비밀만 Secrets, 환경별 일반 설정은 Variables (b) 모든 값을 Secrets.
- **추천**: (a). 비밀 여부와 설정 변경 이력을 구분하고 최소 권한을 유지한다.
- **사용자 방향**: 추천대로 진행. `production` Environment를 SSOT로 사용하고 운영 서버 `.env`를
  최종 제거한다.
- **상태**: 완료. 활성 서버 `.env` 제거는 4차 검증 뒤 수행한다.

## 2차 - 애플리케이션과 Compose Secrets 전환

- **작업내용**: Node 런타임은 `/run/secrets/*`를 프로세스 환경에 올린 뒤 앱을 시작하는
  distroless 호환 로더를 사용한다. Spring은 non-root entrypoint에서 동일 계약을 적용한다.
  PostgreSQL은 공식 `POSTGRES_PASSWORD_FILE`을 사용한다. Cloudflare Tunnel도 토큰 파일을
  직접 읽도록 저장소 Compose가 소유한다.
- **논의 필요**: 앱별 별도 로더와 공통 로더 중 무엇을 사용할지.
- **선택지**: (a) 검증된 공통 로더 + 서비스별 허용 목록 (b) 서비스별 중복 스크립트.
- **추천**: (a). 로딩 계약은 하나로 두고 마운트 목록으로 최소 권한을 강제한다.
- **사용자 방향**: 추천대로 진행.
- **상태**: 구현 완료, 운영 배포 검증 대기.

## 3차 - 배포 워크플로 무상태화와 러너 격리

- **작업내용**: `.env` 자동 로딩을 비활성화한다. 필수 Environment Secrets/Variables의 이름과
  비어 있지 않음을 사전 검사한 뒤 Compose preflight와 배포에 동일 값을 전달한다. 기존 `.env`
  생성/upsert 단계를 제거한다. PR/품질 검증과 ARM64 build/publish는 GitHub-hosted runner에서
  실행하고, 운영 배포만 보호된 `yeon-prod`에서 실행한다. 앱 image ref는 publish 결과의 digest로
  고정한다. 활성 Compose 교체 뒤 실패하면 직전 Compose와 실제 실행 image ID를 자동 복구한다.
- **논의 필요**: GHCR push 인증 실패 재시도를 이번 변경에 포함할지.
- **선택지**: (a) 런타임 시크릿 이관과 함께 bounded retry 추가 (b) 후속 분리.
- **추천**: (a). 동일 운영 워크플로의 검증 가능성과 재실행 안정성을 함께 높인다.
- **사용자 방향**: 추천대로 진행.
- **상태**: 구현 완료, 전체 검증과 운영 배포 대기. 과거 `yeon-ci` runner/계정은 제거 완료.

## 4차 - 운영 전환과 기존 `.env` 제거

- **작업내용**: 전체 이미지 빌드, Compose config, secret mount 권한, preflight, health,
  OAuth/API/DB/R2/Z.ai/타자 레이스 경로를 확인한다. 새 컨테이너가 GitHub Environment에서 전달된
  Compose Secrets만으로 재생성되는 것을 증명한 뒤 `/srv/yeon/.env`를 운영 경로에서 제거한다.
  백업과 rollback 명령은 보존한다.
- **논의 필요**: 운영 호스트 자체 재부팅까지 자동 수행할지.
- **선택지**: (a) 컨테이너 restart 및 recreate까지 검증하고 호스트 reboot는 별도 승인
  (b) 즉시 호스트 reboot.
- **추천**: (a). 서비스 중단을 동반하는 호스트 reboot는 별도 승인 경계로 둔다.
- **사용자 방향**: 추천대로 진행.
- **상태**: 대기. 성공한 운영 배포와 재시작 검증 전에는 활성 `.env`를 삭제하지 않는다.

## 완료 조건

- `/srv/yeon/.env` 없이 `docker compose config`와 전체 서비스 recreate가 성공한다.
- 실행 중 컨테이너의 Docker metadata에 운영 시크릿 값이 직접 환경변수로 저장되지 않는다.
- web/backend/race/db/cloudflared가 정상 상태이고 공개 health 및 핵심 사용자 경로가 통과한다.
- 활성 Compose의 web/backend/race image ref가 GHCR digest로 고정된다.
- GitHub workflow에 서버 `.env` 생성·검사·갱신 코드가 남지 않는다.
- Repository-level runtime Secret/Variable을 제거해 `production` Environment만 SSOT로 남긴다.
- 운영 백업 위치, 복구 절차, 미회전 외부 키 목록을 배포 문서에 남긴다.
