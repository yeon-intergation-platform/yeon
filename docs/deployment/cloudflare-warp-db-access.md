# Cloudflare WARP 운영 DB 접속 설정 기록

이 문서는 운영 DB(`db.yeon.world:5432`)를 Cloudflare WARP/Zero Trust/Tunnel로 접속하기 위해 실제로 적용한 설정, 실패 원인, 최종 해결책, 확인 명령을 기록한다.

## 최종 목표 흐름

```text
psql 또는 DataGrip
→ db.yeon.world:5432
→ Cloudflare WARP private hostname IP(100.80.0.0/16)
→ Cloudflare Access 정책 통과
→ Cloudflare Tunnel yeon-tunnel
→ Docker network yeon-db-edge
→ yeon-db-1(Postgres) :5432
```

성공 기준은 로컬에서 다음 명령이 통과하는 것이다.

```bash
nc -vz -4 db.yeon.world 5432
psql "host=db.yeon.world port=5432 dbname=yeon user=yeon connect_timeout=10"
```

## 적용한 Cloudflare 설정

### 1. Tunnel Published application routes

위치:

```text
Cloudflare Zero Trust
→ Networks
→ Connectors
→ yeon-tunnel
→ Published application routes
```

운영 DB route:

```text
db.yeon.world → tcp://yeon-prod-db:5432
```

현재 운영 route 목록 기준:

```text
ssh.yeon.world    → ssh://192.168.0.2:22
api.yeon.world    → http://yeon-prod-backend:8081
yeon.world        → http://yeon-prod-web:3000
www.yeon.world    → http://yeon-prod-web:3000
race.yeon.world   → http://yeon-prod-race:2567
dev.yeon.world    → http://yeon-dev-web:3000
db.yeon.world     → tcp://yeon-prod-db:5432
dbdev.yeon.world  → tcp://yeon-dev-db:5432
Catch-all         → http_status:404
```

주의: WARP private hostname 접속에서는 Published application route의 service 값만으로 모든 DNS 문제가 끝나지 않는다. `cloudflared`가 요청 hostname인 `db.yeon.world`를 자기 Docker 네트워크에서 다시 해석할 수 있으므로, `cloudflared`가 붙은 네트워크에서 `db.yeon.world`가 내부 DB 컨테이너로 풀려야 한다.

### 2. Tunnel Hostname routes

위치:

```text
Cloudflare Zero Trust
→ Networks
→ Connectors
→ yeon-tunnel
→ Hostname routes
```

추가한 hostname route:

```text
db.yeon.world
dbdev.yeon.world
```

이 설정은 WARP 클라이언트가 해당 hostname을 private hostname으로 인식하게 만드는 쪽이다. 로컬에서 정상 적용되면 `db.yeon.world`가 public Cloudflare IP가 아니라 `100.80.x.x`로 풀린다.

### 3. Access self-hosted application

위치:

```text
Cloudflare Zero Trust
→ Access controls
→ Applications
→ db-yeon-tcp-access
```

적용한 값:

```text
Application name: db-yeon-tcp-access
Destination: db.yeon.world
Session duration: 24 hours
Policy: allow-warp-private-access
Action: ALLOW
Authenticate with Cloudflare One Client: On
Accept all available identity providers: On
Apply instant authentication: Off
Browser rendering: Off
```

정책 의도:

```text
Cloudflare One Client로 인증된 사용자만 db.yeon.world 목적지에 접근한다.
```

참고: `warp-cli target list`는 Access for Infrastructure의 `Targets` 기능 확인용이다. 현재 구성은 Published application route/private hostname 기반이므로, `warp-cli target list`가 비어 있어도 이 DB 접속 구성의 실패 근거가 아니다.

### 4. Device profile

위치:

```text
Cloudflare Zero Trust
→ Team & Resources
→ Devices
→ Device profiles
→ 운영에 사용하는 profile
```

적용한 값:

```text
Service mode: Traffic and DNS mode
Device tunnel protocol: MASQUE 또는 WireGuard
```

이번 장애 확인 중 WireGuard와 MASQUE를 모두 시도했다. 최종 원인은 터널 프로토콜이 아니라 `cloudflared` 측 origin 해석 문제였으므로, MASQUE 자체가 필수 해결책은 아니다. 다만 네트워크 환경에서 WireGuard가 불안정할 때 MASQUE로 바꿔 테스트할 수 있다.

### 5. Gateway proxy and inspection

위치:

```text
Cloudflare Zero Trust
→ Traffic policies
→ Traffic settings
→ Proxy and inspection
```

적용한 값:

```text
Allow Secure Web Gateway to proxy traffic: On
Select protocols to forward:
  TCP: On
  UDP: On
  ICMP: On
Inspect HTTPS requests with TLS decryption: Off
Allow protocol detection: Off
```

DB 접속은 TCP 5432이므로 최소한 TCP forwarding이 켜져 있어야 한다.

### 6. Split Tunnel include

위치:

```text
Device profile
→ Split Tunnels
→ Include IPs and domains
```

적용한 include 항목:

```text
192.168.0.0/24
100.80.0.0/16
2606:4700:0cf1:4000::/64
ssh.yeon.world
db.yeon.world
dbdev.yeon.world
yeonhyeonjun.cloudflareaccess.com
*.cloudflareaccess.com
```

각 항목의 의미:

```text
192.168.0.0/24                  → Yeon private network 접근
100.80.0.0/16                   → WARP private hostname IPv4 대역
2606:4700:0cf1:4000::/64        → WARP private hostname IPv6 대역
ssh.yeon.world                  → SSH private hostname
db.yeon.world                   → 운영 DB private hostname
dbdev.yeon.world                → 개발 DB private hostname
yeonhyeonjun.cloudflareaccess.com → Access 재인증 도메인
*.cloudflareaccess.com          → Access 재인증/조직 로그인 도메인
```

`yeonhyeonjun.cloudflareaccess.com`과 `*.cloudflareaccess.com`을 include하지 않으면 Access 재인증 화면에서 다음 오류가 날 수 있다.

```text
Please enable WARP
```

## 실제 장애 흐름

### 1차 실패: public Cloudflare IP로 해석됨

로컬에서 처음에는 다음처럼 public Cloudflare IP가 나왔다.

```text
db.yeon.world → 104.21.68.50
db.yeon.world → 172.67.186.220
```

이 상태는 WARP private hostname route가 적용되지 않은 상태다. Hostname routes, Split Tunnel include, Device profile 적용 여부를 확인해야 한다.

### 2차 실패: 100.80으로 풀리지만 No route to host

설정 적용 후 로컬 DNS는 다음처럼 바뀌었다.

```text
db.yeon.world → 100.80.x.x
```

라우팅도 WARP 인터페이스로 잡혔다.

```bash
ip route get 100.80.x.x
```

예시:

```text
100.80.x.x dev CloudflareWARP table 65743 src 100.96.0.1
```

그런데 TCP 접속은 실패했다.

```bash
nc -vz -4 db.yeon.world 5432
```

예시:

```text
nc: connect to db.yeon.world (100.80.x.x) port 5432 (tcp) failed: No route to host
```

이때 Tunnel live logs에는 TCP stream이 시작된 뒤 실패가 찍혔다.

```text
tcp proxy stream started
Request failed
```

### 최종 원인

운영 서버에서 `cloudflared` 로그를 확인했을 때 다음이 확인됐다.

```text
originService=warp-routing
unable to dial tcp to origin 172.67.186.220:5432
unable to dial tcp to origin 104.21.68.50:5432
```

뜻은 단순하다.

```text
로컬 PC → Cloudflare → yeon-cloudflared 까지는 도착했다.
하지만 yeon-cloudflared가 최종 목적지 db.yeon.world를 내부 DB가 아니라 public Cloudflare IP로 다시 풀었다.
그래서 Cloudflare public IP의 5432 포트로 접속하려다 timeout이 났다.
```

즉, 마지막 문제는 WARP 클라이언트 설정이나 MASQUE 문제가 아니라 `cloudflared` 컨테이너가 붙은 Docker 네트워크에서 `db.yeon.world`를 내부 Postgres로 해석하지 못한 문제였다.

## 최종 해결책

운영 서버에서 `yeon-db-edge` 네트워크에 DB 컨테이너 alias를 추가했다.

```bash
docker network connect --alias db --alias yeon-prod-db --alias db.yeon.world yeon-db-edge yeon-db-1
```

두 번째로 다시 실행하면 다음 오류가 날 수 있다.

```text
endpoint with name yeon-db-1 already exists in network yeon-db-edge
```

이 메시지는 이미 같은 네트워크에 endpoint가 있다는 뜻이다. 첫 번째 실행이 성공했다면 중복 실행 오류로 보면 된다.

해결 후 로컬에서 성공했다.

```bash
nc -vz -4 db.yeon.world 5432
```

성공 예시:

```text
Connection to db.yeon.world (100.80.x.x) 5432 port [tcp/postgresql] succeeded!
```

## 운영 서버 확인 명령

### 컨테이너 상태

```bash
cd /srv/yeon
docker ps
docker compose -f compose.prod.yml ps
```

### cloudflared 로그

Compose service 이름이 맞지 않을 수 있으므로 컨테이너 이름으로 직접 확인한다.

```bash
docker logs --tail=200 yeon-cloudflared-1
docker logs -f --tail=100 yeon-cloudflared-1
```

### Docker network 확인

```bash
docker network ls | grep yeon
```

확인된 주요 네트워크:

```text
yeon-db-edge
yeon-edge
yeon_default
yeon-develop_default
```

### cloudflared와 DB 컨테이너가 같은 네트워크에 있는지 확인

```bash
docker inspect yeon-cloudflared-1 --format '{{json .NetworkSettings.Networks}}'
docker inspect yeon-db-1 --format '{{json .NetworkSettings.Networks}}'
```

확인된 상태:

```text
yeon-cloudflared-1: yeon-db-edge, yeon-edge, yeon_default에 연결
yeon-db-1: yeon-db-edge, yeon_default에 연결
```

### yeon-db-edge에서 내부 DB 이름 확인

```bash
docker run --rm --network yeon-db-edge alpine:3.20 sh -lc '
apk add --no-cache bind-tools busybox-extras >/dev/null
echo "== yeon-prod-db =="
nslookup yeon-prod-db || true
nc -vz yeon-prod-db 5432 || true
echo "== db =="
nslookup db || true
nc -vz db 5432 || true
echo "== db.yeon.world =="
nslookup db.yeon.world || true
nc -vz db.yeon.world 5432 || true
'
```

성공 기준:

```text
yeon-prod-db → 172.21.x.x, 5432 open
db → 172.21.x.x, 5432 open
db.yeon.world → 172.21.x.x, 5432 open
```

실패 기준:

```text
db.yeon.world → 104.21.x.x 또는 172.67.x.x
```

이 경우 `cloudflared`가 다시 public Cloudflare IP로 나가려 한다.

## 로컬 확인 명령

### WARP 재연결

```bash
warp-cli disconnect
warp-cli connect
warp-cli status
warp-cli settings
```

확인할 값:

```text
Status: Connected
Network: healthy
Mode: WarpWithDnsOverHttps 또는 Traffic and DNS mode 계열
Include mode 목록에 db.yeon.world, 100.80.0.0/16, cloudflareaccess.com 도메인 포함
```

### DNS 확인

```bash
nslookup db.yeon.world
dig +short -4 db.yeon.world
```

성공 기준:

```text
100.80.x.x
```

실패 기준:

```text
104.21.x.x
172.67.x.x
```

### route 확인

```bash
ip route get "$(dig +short -4 db.yeon.world | head -1)"
```

성공 기준:

```text
dev CloudflareWARP
```

### TCP 확인

```bash
nc -vz -4 db.yeon.world 5432
```

성공 기준:

```text
succeeded
```

### psql 확인

```bash
psql "host=db.yeon.world port=5432 dbname=yeon user=yeon connect_timeout=10"
```

DataGrip도 같은 값으로 연결한다.

```text
Host: db.yeon.world
Port: 5432
Database: yeon
User: yeon
```

## Access 재인증

Split Tunnel include에 Access 도메인을 추가한 뒤 재연결하고 재인증한다.

```bash
warp-cli disconnect
warp-cli connect
warp-cli debug access-reauth
```

브라우저에서 이메일 로그인 화면이 뜨고 로그인이 완료되면 Access 세션이 갱신된 것이다.

## 영구 반영 권장사항

이번 즉시 복구는 `docker network connect --alias ...` 명령으로 수행했다. 이 방식은 컨테이너/네트워크 재생성 시 사라질 수 있다.

운영 compose에는 DB service가 `yeon-db-edge`에서 다음 alias를 갖도록 영구 반영하는 것이 맞다.

```yaml
services:
  db:
    networks:
      yeon-db-edge:
        aliases:
          - db
          - yeon-prod-db
          - db.yeon.world
```

핵심은 `cloudflared`가 붙은 네트워크에서 `db.yeon.world`를 조회했을 때 public Cloudflare IP가 아니라 내부 DB 컨테이너 IP가 나와야 한다는 점이다.

## 장애 판단 체크리스트

1. `warp-cli status`가 `Connected`인가
2. `warp-cli settings`에 Split Tunnel include 항목이 반영됐는가
3. `nslookup db.yeon.world`가 `100.80.x.x`를 반환하는가
4. `ip route get <100.80.x.x>`가 `CloudflareWARP`를 반환하는가
5. `warp-cli debug access-reauth`가 이메일 로그인까지 완료되는가
6. Access application `db-yeon-tcp-access`에서 `Authenticate with Cloudflare One Client`가 켜져 있는가
7. Published application route가 `db.yeon.world → tcp://yeon-prod-db:5432`인가
8. `yeon-cloudflared-1`과 `yeon-db-1`이 같은 Docker 네트워크(`yeon-db-edge`)에 있는가
9. `yeon-db-edge`에서 `db.yeon.world`가 내부 IP(`172.21.x.x`)로 풀리는가
10. `docker logs yeon-cloudflared-1`에 public Cloudflare IP `:5432` 접속 시도가 더 이상 없는가
11. `nc -vz -4 db.yeon.world 5432`가 성공하는가
12. `psql` 또는 DataGrip 접속이 성공하는가
