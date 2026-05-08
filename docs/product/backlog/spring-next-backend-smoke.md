# Spring Next Backend Smoke Backlog

## 문서 목적
- `apps/web`가 `apps/backend`의 존재를 확인할 수 있는 **최소 smoke 연동**만 추가하기 위한 백로그다.
- 사용자 기능 연동이 아니라 bootstrap 검증용 route 1개만 다룬다.

## 현재 결정
- backend health endpoint: `http://127.0.0.1:8081/actuator/health`
- web는 직접 사용자 화면을 바꾸지 않고 내부 test route로만 확인한다.
- 인증/쿠키/DB/SSR 분기는 이번 범위에서 제외한다.

## 비목표
- 실제 기능 API 프록시 전환
- auth/session 연동
- frontend UI 노출
- Playwright e2e

## 완료 기준
1. `apps/web`에 backend health를 호출하는 최소 route가 있다.
2. backend base URL은 env 또는 안전한 기본값으로 해석된다.
3. 성공/실패 응답이 분리된다.
4. route 단위 테스트가 있다.
5. 로컬에서 테스트가 통과한다.

## 차수 1 — 최소 smoke route
- 작업내용: `apps/web` 내부 test route 하나를 추가한다.
- 논의 필요: `api/test` namespace 유지 여부
- 선택지: `api/test/backend-bootstrap-health`
- 추천: 사용자 기능과 분리되는 `api/test` namespace 사용
- 사용자 방향: 추천 기준 진행
- 세부 단계:
  1. backend base URL 해석 규칙을 정한다.
  2. `GET` 전용 route를 만든다.
  3. upstream `/actuator/health`를 fetch 한다.
  4. 성공 시 최소 JSON으로 감싼다.
  5. 실패 시 502 성격 오류로 감싼다.
  6. timeout/exception 메시지를 최소화한다.
  7. route test를 추가한다.
  8. web test로 검증한다.
  9. curl 또는 fetch smoke 증거를 남긴다.
  10. 기능 연동 없이 멈춘다.
