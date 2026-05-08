# spring-googledrive-browser package plan

## 목적
- `googledrive status/files/file-content` read/browser 경로를 Spring으로 이동한다.
- Next는 인증 세션 확인과 응답 번역만 담당한다.

## 패키지
- `world.yeon.backend.googledrive_browser.controller`
- `world.yeon.backend.googledrive_browser.service`
- `world.yeon.backend.googledrive_browser.repository`
- `world.yeon.backend.googledrive_browser.dto`

## 책임 분리
- controller
  - internal endpoint 노출
  - `X-Yeon-User-Id` 수신
  - 상태 코드/에러 shape 고정
- service
  - token 조회/갱신
  - scope 확인
  - Drive files list/content download orchestration
- repository
  - `googledrive_tokens` 조회/갱신
- Next route
  - auth gate
  - Spring error → `jsonError(...)`
  - binary response pass-through

## 범위 밖
- OAuth start/callback
- analyze/import orchestration
