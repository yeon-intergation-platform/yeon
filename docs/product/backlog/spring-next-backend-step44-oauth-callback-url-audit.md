# 차수44 OAuth Callback URL 정합성 점검
- 생성일시: 2026-05-09T21:45:00+09:00
- 작업내용: 구글/원드라이브 OAuth callback 경로를 로컬·프리뷰·운영·www/루트 규칙으로 재검증한다.
- 논의 필요: callback URL 소스오브트루스를 코드 상수로 고정할지, 배포 설정 환경변수로 분리할지.
- 선택지:
  1. 코드 상수 + env 병행(현재 방식) 고정
  2. 완전 env 기반 동적 생성
- 추천: 코드 상수 + env 분기 유지(오류 추적 쉬움)
- 사용자 방향: 추천 기준 진행
- 확장 산출:
  - 대상 라우트: `/api/v1/integrations/{googledrive|onedrive}/auth/callback`
  - 점검 대상 URL: localhost, yeon.world, www.yeon.world, dev.yeon.world
  - 점검 결과 항목: 앱 등록 URI와 실제 리다이렉트 URI 동일성, OAuth 인증 실패 로그 메시지

