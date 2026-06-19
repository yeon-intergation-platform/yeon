# Bugsink 오류 수집 운영

Yeon은 Bugsink를 Sentry SDK 호환 에러 트래커로 사용한다. Bugsink 프로젝트 DSN만 환경변수로
주입하면 기존 Sentry SDK가 Bugsink 서버로 오류 이벤트를 보낸다.

## 프로젝트 분리

- `yeon-web`: Next.js browser/server/edge 오류
- `yeon-backend`: Spring backend 오류

모바일과 race-server는 이번 차수 범위 밖이다. 앱별 노이즈와 rate limit을 분리하려면 Bugsink
프로젝트를 런타임별로 나눈다.

## 환경변수

```bash
BUGSINK_DSN=https://...
NEXT_PUBLIC_BUGSINK_DSN=https://...
SENTRY_ENV=production
```

`BUGSINK_DSN`이 서버 런타임용, `NEXT_PUBLIC_BUGSINK_DSN`이 브라우저용이다. 기존 Sentry SaaS
DSN을 계속 쓰는 경우에만 `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`을 사용한다. Bugsink DSN이
있으면 Bugsink DSN이 우선한다.

## 샘플링

Bugsink는 error events 중심으로 동작하고 traces/metrics를 받지 않는다. 그래서 Yeon 설정은
`tracesSampleRate=0` / `sentry.traces-sample-rate=0.0`을 기본값으로 둔다. 사용자 개인정보는
기본 전송하지 않는다.

## 서버 배치

Bugsink 서버는 두 레포가 함께 바라보는 공용 인프라로 둔다. 앱 저장소에는 SDK 연결과 DSN
환경변수만 남기고, Bugsink 자체 `compose.yaml`과 데이터베이스 백업 정책은 별도 운영 인프라에서
관리한다.
