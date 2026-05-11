# 작업 로그: main 머지 전 검증 이슈 해결

## 작업내용

- 타입/빌드 실패 원인 정리: `analyticsEvents` import 누락, `typing-deck-library-screen` 중복 함수/속성 오류 수정
- SEO/색인 조치: `card-service` 루트 인덱스 허용, 덱 상세 및 play 페이지 noindex 유지
- 변경 파일은 브랜치 기준 9개로 제한

## 사용자 방향

- merge-block 제거 후 `main` 대비 리베이스 후 머지

## 검증

- `pnpm --filter @yeon/web build` 성공
- `git diff --check`
