# 카드 추가 모달 시니어 리팩터링 작업 로그

## 목표

- 카드 추가 직접 작성 폼의 입력 책임과 모달 액션 책임을 분리한다.
- 저장/업로드 진행 중 모달 닫기 경계를 방어한다.
- 기존 질문/답변 동시 작성 및 실시간 미리보기 UX는 유지한다.

## 진행

- 작업 브랜치: `codex/card-add-senior-refactor`
- 대상 파일: 카드 추가 모달/폼/미리보기 컴포넌트

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 완료 내용

- 직접 작성 폼 내부 sticky 저장/취소 영역을 제거하고 `ResponsiveModal.footer`로 액션을 이동했다.
- `AddCardFormActionState`로 제출 가능 여부, pending, 버튼 문구, 에러 메시지를 부모 모달에 보고한다.
- 모달은 form id 기반 외부 submit을 사용하고, 저장/업로드 진행 중 닫기 요청을 차단한다.
- 질문/답변 입력 영역과 데스크톱/모바일 미리보기 동작은 유지했다.

## 검증 결과

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과 (`pnpm install --frozen-lockfile`로 누락된 workspace 링크 복구 후 재실행)
- `git diff --check` 통과
- `curl -I --max-time 3 http://localhost:3000/` 실패: 로컬 dev server 미기동
