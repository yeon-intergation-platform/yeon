# 6차 작업 기록 - 스타 로비 개발용 수동 관측 전송기

## 목표

OCR/스타 자동조작 없이도 `수동 입력 → Spring 저장/매칭 → race-server publish → 웹 알림 표시` 파이프를 검증할 수 있게 한다.

## 변경

- `scripts/star-lobby-dev-observation.mjs` 추가.
- 기본 샘플 방 목록 전송을 지원한다.
- `--room`, `--players`, `--file`, `--empty`, `--dry-run` 옵션을 지원한다.
- `SPRING_BACKEND_BASE_URL`과 `SPRING_INTERNAL_TOKEN` 환경변수를 읽어 Spring 관측 API로 전송한다.

## 검증

- `node --check scripts/star-lobby-dev-observation.mjs`
- `node scripts/star-lobby-dev-observation.mjs --help`
- `node scripts/star-lobby-dev-observation.mjs --dry-run --room "랜타디 초보 3/6" --room "빨무 팀플 5/8"`
- `git diff --check`

## 남은 일

- 실제 dev server 조합에서 Spring/Race/Web을 켜고 스크립트 전송 후 `/star-lobby` 화면 알림을 확인한다.
- 서버 저장 알림 조건 생성 UI를 붙인다.
- OCR 관측기는 스타 로비 스크린샷 샘플 수집 뒤 별도 검증한다.
