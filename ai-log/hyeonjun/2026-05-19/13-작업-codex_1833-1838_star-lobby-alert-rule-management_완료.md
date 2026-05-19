# 13 작업 codex — star-lobby alert-rule management

## 목표

- 저장된 스타 로비 키워드 알림 조건을 사용자가 끄기/켜기 및 삭제할 수 있게 한다.
- 알림 조건 원천은 Spring에 두고 Next.js는 BFF 브리지만 유지한다.

## 변경

- Spring `PATCH /api/v1/star-lobby/alert-rules/{ruleId}`로 enabled 토글/부분 수정 경로를 추가했다.
- Spring `DELETE /api/v1/star-lobby/alert-rules/{ruleId}`로 소유자 범위 삭제 경로를 추가했다.
- Next BFF 동적 route와 Spring client 함수를 추가했다.
- `/star-lobby` 저장 조건 목록에 상태 배지, 알림 끄기/켜기, 삭제 액션을 연결했다.

## 범위 제외

- Discord 알림 연동은 다음 차수다.
- OCR 관측기는 사용자가 실제 스타크래프트 로비 스크린샷을 제공한 뒤 개발한다.
- 이름/키워드/인원 조건 인라인 수정과 중복 조건 방지는 후속 개선으로 남긴다.

## 검증

- `./gradlew test --tests '*StarLobby*'`
- `pnpm --filter @yeon/api-contract typecheck`
- `pnpm --filter @yeon/api-contract lint`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
