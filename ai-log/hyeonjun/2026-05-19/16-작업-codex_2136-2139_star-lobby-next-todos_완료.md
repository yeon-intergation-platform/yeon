# 16 작업 codex 2136-2139 star-lobby-next-todos 완료

## 목표

- 스타 로비 도메인 코드 리뷰 후 남은 별도 이슈를 다음 작업자가 바로 이어받을 수 있게 공식 TODO로 기록한다.

## 기록한 TODO

- 알림 조건 인원 제한 clear 지원: `PATCH`에서 필드 누락과 명시적 null을 구분하는 presence-aware DTO 필요.
- 방 identity / snapshot 정책 재설계: 현재 `방제+인원` identity는 반복 알림/가짜 disappear 위험이 있으며 OCR 샘플 후 확정 필요.
- Discord 웹훅 손상/복호화 실패 상태 표시: `connected=true`와 실제 전송 불능 상태가 갈라질 수 있어 failure state 저장 필요.
- OCR 스크린샷 수집 후 관측기 PoC: 실제 스타 로비 스크린샷 확보 전 좌표/클릭/로그인 자동화 개발 금지.

## 구현 가능성

- A/C는 지금 바로 구현 가능하다.
- B는 반복 알림 억제 중심의 임시 정책은 지금 구현 가능하지만, 최종 identity는 OCR/관측 샘플이 있어야 안전하다.
- D는 사용자가 스크린샷을 제공한 뒤 구현 가능하다.

## 검증

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
