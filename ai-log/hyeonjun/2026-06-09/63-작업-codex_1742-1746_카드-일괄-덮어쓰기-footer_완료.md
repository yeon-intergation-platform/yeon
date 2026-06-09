# 카드 일괄 추가 덮어쓰기 footer 노출

- 요청: 일괄 추가 모달의 추가 버튼 옆에 덮어쓰기 버튼 추가.
- 범위: apps/web 카드 서비스 앞단. 기존 replaceCards 포트 사용.
- 변경:
  - 일괄 추가 모드에서도 ResponsiveModal footer를 사용하도록 변경.
  - footer에 취소 / 덮어쓰기 / 추가 버튼을 함께 노출.
  - 덮어쓰기 submit action은 기존 카드 전체 삭제 후 인식된 카드 목록으로 교체하는 replaceCards mutation으로 연결.
  - 저장/덮어쓰기 pending 중에는 닫기 방지 로직도 함께 적용.
- 검증:
  - CI=true pnpm --filter @yeon/web lint
  - CI=true pnpm --filter @yeon/web typecheck
  - git diff --check
