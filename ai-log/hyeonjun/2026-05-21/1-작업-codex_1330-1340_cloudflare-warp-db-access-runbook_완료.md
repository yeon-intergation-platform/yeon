# Cloudflare WARP DB 접속 runbook 기록

## 목표

운영 DB(`db.yeon.world:5432`)를 Cloudflare WARP + Access + Tunnel + Published application route로 접속하기 위한 실제 설정값, 실패 원인, 최종 복구 절차와 확인 명령을 `docs/deployment/`에 공식 기록한다.

## 확인된 사실

- `db.yeon.world` DNS가 로컬 WARP 클라이언트에서 public Cloudflare IP가 아니라 `100.80.x.x`로 풀려야 한다.
- `ip route get <100.80.x.x>`는 `CloudflareWARP` 인터페이스로 나가야 한다.
- Device profile은 `Traffic and DNS mode`를 사용한다.
- WireGuard와 MASQUE를 모두 시도했지만 최종 원인은 터널 프로토콜이 아니라 `cloudflared` 측 origin DNS 해석 문제였다.
- Split Tunnel include에는 DB/SSH hostname뿐 아니라 Access 재인증 도메인도 필요했다.
  - `yeonhyeonjun.cloudflareaccess.com`
  - `*.cloudflareaccess.com`
- Access 재인증 도메인이 include되지 않으면 `Please enable WARP` 오류가 발생할 수 있다.
- `warp-cli target list`는 Access for Infrastructure Targets용이므로 Published application route 방식에서는 비어 있어도 단독 실패 근거가 아니다.
- Published application route의 운영 DB target은 `tcp://yeon-prod-db:5432`로 기록한다.
- `cloudflared` 로그에서 `originService=warp-routing`이 `db.yeon.world`를 public Cloudflare IP(`104.21.x.x`, `172.67.x.x`)로 해석해 `:5432` 연결을 시도하는 것이 확인됐다.
- `yeon-db-edge` 네트워크에 `db.yeon.world` alias를 추가한 뒤 로컬 `nc -vz -4 db.yeon.world 5432`가 성공했다.
- 두 번째 `docker network connect ...` 실행의 `endpoint with name yeon-db-1 already exists`는 첫 번째 연결/alias 적용 이후 중복 실행으로 판단한다.

## 작업

- `docs/deployment/cloudflare-warp-db-access.md`에 다음을 정리했다.
  - 최종 목표 흐름
  - Tunnel Published application routes
  - Hostname routes
  - Access self-hosted application 설정
  - Device profile / MASQUE / WireGuard 메모
  - Gateway TCP/UDP/ICMP proxy 설정
  - Split Tunnel include 목록
  - Access 재인증 도메인 포함 이유
  - 실제 실패 로그와 원인
  - `docker network connect --alias ...` 즉시 복구 명령
  - compose 영구 반영 권장 alias
  - 로컬/운영 서버 확인 명령
  - 장애 판단 체크리스트
- `docs/deployment/README.md`에 문서 링크를 유지했다.

## 검증

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과

## 운영 DB 카카오 identity 복구 조치

### 배경

- 카카오 앱을 test 앱에서 운영 앱으로 전환하면서 같은 사용자 이메일의 Kakao `provider_user_id`가 달라져 로그인 충돌이 발생했다.
- Spring 로그인 로직은 같은 이메일 사용자에 같은 provider(`kakao`)의 다른 `provider_user_id`가 이미 있으면 기존 사용자를 재사용하지 않는다.
- 새 운영 Kakao `provider_user_id`는 실패한 로그인 시점에 DB에 저장되지 않았으므로 직접 `old id → new id` UPDATE는 불가능했다.

### 조회 결과

- 운영 DB `public.user_identities`에서 `provider='kakao'` identity는 1건이었다.
- 해당 identity의 기존 test-app `provider_user_id`는 `4844485153`이었다.

### 적용 조치

- `public.ops_kakao_identity_relink_backup_20260521` 백업 테이블을 생성했다.
- 기존 Kakao identity 1건을 백업 테이블에 보관했다.
- `public.user_identities`에서 기존 `provider='kakao'` identity 1건을 삭제했다.

### 의도

- 다음 운영 카카오 로그인 시 같은 이메일의 기존 `public.users` 레코드를 재사용한다.
- 이후 Spring 로그인 로직이 운영 Kakao 앱의 새 `provider_user_id`로 `provider='kakao'` identity를 새로 삽입하게 한다.

### 검증

- 삭제 후 `public.user_identities where provider='kakao'` count는 0이다.
- 백업 테이블 row count는 1이다.
- 기존 `public.users` 레코드는 유지되어 있다.

### 롤백

운영 카카오 재로그인이 실패하고 기존 test identity를 되돌려야 하면 백업 테이블에서 복원한다.

```sql
insert into public.user_identities (
  id,
  user_id,
  provider,
  provider_user_id,
  email,
  display_name,
  avatar_url,
  linked_at,
  last_login_at
)
select
  identity_id,
  user_id,
  provider,
  provider_user_id,
  email,
  display_name,
  avatar_url,
  linked_at,
  last_login_at
from public.ops_kakao_identity_relink_backup_20260521
where identity_id = '408eaa09-db8e-40d2-a34f-d5a575912bc3'::uuid
  and not exists (
    select 1
    from public.user_identities ui
    where ui.id = '408eaa09-db8e-40d2-a34f-d5a575912bc3'::uuid
  );
```
