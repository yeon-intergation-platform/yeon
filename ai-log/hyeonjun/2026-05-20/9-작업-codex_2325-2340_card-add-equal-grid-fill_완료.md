# 카드 추가 equal grid fill 레이아웃 작업 로그

## 목표

- 카드 추가 직접 작성 모드에서 질문/답변 편집기와 미리보기 4칸이 남은 모달 공간을 균등하게 사용하게 한다.

## 검증 예정

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `localhost:3001` Playwright 레이아웃 확인

## 구현

- 카드 추가 패널 내부를 `h-full min-h-0 flex-col`로 연결해 직접 작성 영역이 모달 body의 남은 높이를 받을 수 있게 했다.
- `AddCardForm`의 좌측 편집 컬럼을 desktop 기준 `grid-rows-[1fr_1fr]`로 바꿔 질문/답변 editor가 남은 높이를 반반 나누게 했다.
- 오른쪽 preview rail도 desktop 기준 `grid-rows-[1fr_1fr]`로 바꿔 질문/답변 미리보기가 같은 높이를 공유하게 했다.
- compact editor의 desktop 내부 고정 높이/최대 높이/내부 스크롤을 해제하고 부모 칸 높이를 채우도록 조정했다.
- 툴바 라벨은 `text-[13px]`, `min-w-[72px]`, `pr-3`로 낮추고 첫 버튼과 간격을 확보했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- 사용자 요청에 따라 결과 확인 전 커밋까지만 진행한다.

## 추가 수정

- 기존 커밋에서 compact editor에 남아 있던 `h-*`, `max-h-*`, `overflow-y-auto`를 제거했다.
- 질문/답변 editor와 질문/답변 preview를 별도 좌우 컬럼이 아니라 같은 desktop 2x2 grid에 배치했다.
- grid row를 `minmax(min-content, 1fr)`로 바꿔 기본 상태에서는 남은 공간을 반반 쓰고, 본문이 길어지면 내부 스크롤이 아니라 박스 자체가 커질 수 있게 했다.

## 추가 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
