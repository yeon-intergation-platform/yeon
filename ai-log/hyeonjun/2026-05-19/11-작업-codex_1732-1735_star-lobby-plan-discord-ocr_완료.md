# 스타 로비 남은 작업 계획 고정

- 일시: 2026-05-19 17:32~17:35
- 작업자: Codex
- 브랜치: docs/star-lobby-discord-ocr-plan

## 작업 내용

- 스타 로비 백로그에 외부 알림 수단을 Discord 우선으로 명시했다.
- OCR/화면 인식은 사용자가 실제 스타크래프트 로비 스크린샷을 제공한 뒤에만 개발한다고 명시했다.
- 다음 개발 순서를 현재 방 목록, 알림 조건 관리, Discord 알림, 스크린샷 기반 OCR PoC로 정리했다.

## 검증

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
