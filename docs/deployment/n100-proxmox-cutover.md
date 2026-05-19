# N100 Proxmox 운영 이전 계획

기준일: 2026-05-19

## 현재 운영 상황 요약

- 현재 운영 서비스는 Raspberry Pi ARM64 self-hosted runner에서 배포된다.
- `main` push 시 `.github/workflows/docker-image.yml`이 변경 범위를 감지하고 Docker 서비스를 배포한다.
- Docker 이미지는 이미 `linux/amd64`와 `linux/arm64`를 모두 빌드한 뒤 multi-arch manifest로 publish한다.
- 실제 운영 배포 job은 `runs-on: [self-hosted, Linux, ARM64]`라 Raspberry Pi에 고정되어 있다.
- 운영 compose 기준 경로는 `/srv/yeon/compose.prod.yml`이고 `.env`는 서버 로컬에만 존재한다.
- 운영 서비스 구성은 `backend`, `web`, `race-server`, `db(Postgres)`다.
- 운영 접근은 Cloudflare Zero Trust/Tunnel 기반이라 서버 공인 IP나 DNS A 레코드에 직접 의존하지 않는 구성이 목표다.
- StarCraft OCR 관측기는 Linux 운영 서버에 넣지 않는다. Windows VM에서 별도 관측 클라이언트로 실행하고 Spring API로 관측 결과를 전송한다.
- 현재 실사용자는 없으므로 장기간 blue/green 병행보다 짧은 중단 후 N100으로 공격적 절체한다.

## 목표 운영 구조

```text
N100 Proxmox
├─ Linux VM
│  ├─ Docker / Docker Compose
│  ├─ backend / web / race-server / Postgres
│  ├─ cloudflared
│  └─ GitHub self-hosted runner: yeon-prod-amd64
│
└─ Windows VM
   ├─ StarCraft 실행
   ├─ star-observer 실행
   └─ OCR 결과를 Spring API로 전송
```

## 이전 원칙

- Raspberry Pi 운영을 길게 병행하지 않는다.
- DNS 레코드 전환이 아니라 Cloudflare Tunnel connector/origin 전환으로 처리한다.
- DB dump/restore 순서를 절대 생략하지 않는다.
- OCR 관측기는 운영 compose에 포함하지 않는다.
- GitHub Actions 자동 배포 대상은 N100 검증 후 `yeon-prod-amd64`로 전환한다.
- ARM64 경로는 N100 정상화 후 제거하거나 수동 rollback 후보로만 남긴다.

## 상세 체크리스트

### 1. N100 Proxmox 준비

- [ ] Proxmox 설치 및 관리 콘솔 접속 확인
- [ ] Linux VM 생성
  - [ ] CPU: x86_64 / amd64
  - [ ] Docker 실행 가능한 메모리와 디스크 할당
  - [ ] 고정 내부 IP 또는 Proxmox 내부 네트워크 이름 확정
- [ ] Windows VM 생성
  - [ ] StarCraft 실행 가능 여부 확인
  - [ ] 화면 캡처/OCR 권한 문제 없는지 확인
  - [ ] 절전/화면잠금 정책 비활성화

### 2. N100 Linux VM 기본 패키지

- [ ] Docker 설치
- [ ] Docker Compose plugin 설치
- [ ] cloudflared 설치
- [ ] PostgreSQL client 도구 설치: `pg_dump`, `pg_restore`, `psql`
- [ ] GitHub self-hosted runner 설치
- [ ] runner label 등록
  - [ ] `self-hosted`
  - [ ] `Linux`
  - [ ] `X64`
  - [ ] `yeon-prod-amd64`
- [ ] runner service 자동 시작 등록
- [ ] runner가 GitHub Actions에서 online인지 확인

### 3. N100 운영 디렉터리와 네트워크

- [ ] `/srv/yeon` 생성
- [ ] `/srv/yeon/.env` 작성
  - [ ] Raspberry Pi 운영 `.env`와 값 대조
  - [ ] `DATABASE_URL`
  - [ ] `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - [ ] `AUTH_SECRET`
  - [ ] `SPRING_INTERNAL_TOKEN`
  - [ ] OAuth/R2/OpenAI 등 운영 secret
  - [ ] Discord webhook 관련 값은 비어 있어도 부팅 가능해야 함
- [ ] `compose.prod.yml` 배치
- [ ] Docker network 생성

```bash
docker network create yeon-edge
docker network create yeon-db-edge
```

- [ ] 네트워크 중복 생성 시에도 실패 없이 넘어가는 절차 확인

### 4. Raspberry Pi 최종 백업

- [ ] 현재 Pi `/srv/yeon/.env` 별도 백업
- [ ] 현재 Pi `compose.prod.yml` 별도 백업
- [ ] 현재 실행 컨테이너 확인

```bash
cd /srv/yeon
docker compose -f compose.prod.yml ps
```

- [ ] DB dump 생성

```bash
cd /srv/yeon
docker compose -f compose.prod.yml exec db pg_dump -U yeon -d yeon -Fc > yeon-prod.dump
```

- [ ] dump 파일 크기 확인
- [ ] dump 파일을 N100 Linux VM으로 복사
- [ ] dump 복사 후 checksum 비교

### 5. Raspberry Pi 운영 중단

- [ ] Pi에서 compose 중단

```bash
cd /srv/yeon
docker compose -f compose.prod.yml down
```

- [ ] Pi cloudflared 중지
- [ ] Pi GitHub runner 중지 또는 offline 처리
- [ ] Pi는 즉시 초기화하지 말고 rollback용으로 전원 유지

### 6. N100 DB 복구

- [ ] N100에서 DB만 먼저 기동

```bash
cd /srv/yeon
docker compose -f compose.prod.yml up -d db
```

- [ ] DB health 확인

```bash
docker compose -f compose.prod.yml ps db
```

- [ ] dump restore

```bash
cd /srv/yeon
docker compose -f compose.prod.yml exec -T db pg_restore \
  -U yeon \
  -d yeon \
  --clean \
  --if-exists < yeon-prod.dump
```

- [ ] restore 로그 오류 확인
- [ ] 주요 테이블 row count 확인
- [ ] Flyway schema version 확인

### 7. N100 서비스 기동

- [ ] 전체 서비스 기동

```bash
cd /srv/yeon
docker compose -f compose.prod.yml up -d --wait
```

- [ ] 서비스 상태 확인

```bash
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs --tail=100 backend
docker compose -f compose.prod.yml logs --tail=100 web
docker compose -f compose.prod.yml logs --tail=100 race-server
```

- [ ] backend health 확인: `/actuator/health`
- [ ] web health 확인: `/api/health`
- [ ] race-server health 확인: `/health`
- [ ] Spring migration이 정상 완료됐는지 확인
- [ ] web → backend 내부 호출 확인
- [ ] race-server → backend 내부 호출 확인

### 8. Cloudflare Tunnel 전환

- [ ] N100 cloudflared가 같은 Tunnel credential을 사용할 수 있게 설정
- [ ] Tunnel ingress rule이 N100 local origin을 바라보는지 확인
  - [ ] `yeon.world` → web `localhost:3000` 또는 compose network origin
  - [ ] `www.yeon.world` → web
  - [ ] `race.yeon.world` → race-server
- [ ] Pi cloudflared가 꺼진 상태인지 확인
- [ ] N100 cloudflared 시작
- [ ] Cloudflare Zero Trust 대시보드에서 connector online 확인
- [ ] 외부에서 `https://yeon.world` 접속 확인
- [ ] 외부에서 websocket/race 경로 확인

### 9. GitHub Actions 자동 배포 전환

- [ ] `.github/workflows/docker-image.yml`의 운영 배포 runner를 N100 label로 전환

```yaml
runs-on: [self-hosted, yeon-prod-amd64]
```

- [ ] 단계명에서 Raspberry Pi 고정 표현 제거
- [ ] `/srv/yeon` 경로는 N100 Linux VM 기준으로 유지
- [ ] `compose.prod.yml` sync 유지
- [ ] preflight 로직 유지
  - [ ] backend `/actuator/health`
  - [ ] web `/api/health`
  - [ ] race-server `/health`
- [ ] workflow_dispatch로 수동 실행해 N100 배포 확인
- [ ] 이후 main push 자동 배포가 N100에서 수행되는지 확인

### 10. Windows star-observer 껍데기

- [ ] `apps/star-observer`는 운영 compose에 넣지 않는다.
- [ ] Windows VM에서 실행되는 별도 앱/프로세스로 둔다.
- [ ] 초기 기능은 OCR이 아니라 운영 연결성 검증만 포함한다.
  - [ ] `STAR_OBSERVER_API_BASE_URL` 읽기
  - [ ] `STAR_OBSERVER_API_TOKEN` 읽기
  - [ ] observer id / machine name / version 전송
  - [ ] heartbeat 전송
  - [ ] OCR 상태는 `not_configured`로 보고
- [ ] backend에 observer heartbeat 수신 API가 있어야 한다.
- [ ] 운영 관리 페이지에서 observer online/offline과 마지막 heartbeat를 확인한다.
- [ ] 실제 OCR은 StarCraft 로비 스크린샷 기준점 확보 후 별도 차수로 구현한다.

### 11. Raspberry Pi 제거

- [ ] N100 운영 정상화 후 최소 1회 main 자동 배포 성공 확인
- [ ] Pi runner GitHub 등록 제거
- [ ] Pi cloudflared service 제거
- [ ] Pi compose는 down 상태 유지
- [ ] Pi DB dump 장기 보관 위치로 이동
- [ ] 문서에서 Raspberry Pi 운영 문서를 deprecated 처리하거나 N100 문서로 대체
- [ ] ARM64 자동 배포 job은 제거하거나 수동 백업 용도로만 남긴다.

## Rollback 기준

- N100 DB restore 실패: Pi compose/cloudflared를 다시 켠다.
- N100 서비스 health 실패: N100 compose down 후 Pi compose/cloudflared를 다시 켠다.
- Cloudflare Tunnel 전환 실패: N100 cloudflared 중지 후 Pi cloudflared를 다시 켠다.
- GitHub Actions 전환 실패: workflow runner label을 ARM64/Pi 경로로 되돌린다.

## 완료 기준

- N100 Linux VM에서 `backend`, `web`, `race-server`, `db`가 모두 healthy다.
- Cloudflare Tunnel을 통해 `yeon.world`가 N100으로 연결된다.
- GitHub Actions main 자동 배포가 `yeon-prod-amd64` runner에서 성공한다.
- Windows VM observer 껍데기가 backend로 heartbeat를 보낸다.
- Raspberry Pi 없이도 운영 확인이 가능하다.
