# 카드 추가 모달 코드리뷰 후속 수정 (2026-05-20)

## 배경

PR #518로 카드 추가 직접 작성 화면을 좌우 분할과 실시간 카드 앞면/뒷면 미리보기 구조로 바꿨지만, 코드리뷰에서 모바일 미리보기 회귀, 모달 높이 magic number, sticky footer와 부모 padding 결합, 미리보기 렌더 중복, 빈 콘텐츠 판정 분리, compact layout API 누수, 일괄 추가 모드 폭 과다 문제가 확인됐다.

## 1차

### 작업내용

- 데스크톱에서는 오른쪽 통합 미리보기를 유지하되, 모바일/좁은 화면에서는 에디터별 작성/미리보기 전환을 복구한다.
- `calc(90vh-220px)` 같은 모달 높이 magic number를 제거하고 flex/grid 흐름으로 미리보기 높이를 제어한다.
- 저장/취소 sticky 바가 `ResponsiveModal`의 내부 padding에 음수 margin으로 의존하지 않게 한다.
- 기존 에디터 미리보기와 신규 카드 앞면/뒷면 미리보기가 공통 preview surface를 사용하게 한다.
- 저장 가능 여부와 미리보기 빈 상태 판정을 공통 rich-content helper로 통합한다.
- 공용 에디터 API에서 `compactQuestion`, `compactAnswer` 같은 특정 화면 전용 density 키가 직접 노출되지 않게 정리한다.
- 직접 작성 모드와 일괄 추가 모드의 모달 폭을 분리한다.

### 논의 필요

- 모바일에서 통합 앞면/뒷면 미리보기까지 별도 표시할지, 에디터별 미리보기만 복구할지 확인이 필요하다.
- 저장/취소 버튼을 완전한 `ResponsiveModal.footer`로 올릴지, 현 단계에서는 form 내부 sticky bar의 parent padding 의존만 제거할지 판단이 필요하다.

### 선택지

1. 최소 구조 수정: 모바일 에디터별 미리보기 복구, magic number/음수 margin 제거, 공통 helper와 preview surface 추출.
2. 큰 구조 수정: `ResponsiveModal.footer`와 form id까지 포함해 footer를 모달 레벨로 완전 이관한다.
3. 디자인 재설계: 모바일 전용 상단 sticky preview tab까지 새로 만든다.

### 추천

1번. 현재 운영 반영된 UI의 핵심 구조는 유지하면서 코드리뷰에서 지적된 잠재버그와 구조 부채를 빠르게 줄일 수 있다. `ResponsiveModal.footer` 완전 이관은 form state lift가 커져 별도 차수로 분리하는 편이 안전하다.

### 사용자 방향

코드리뷰 지적사항을 전부 수정한다. 추천 기준으로 진행하되, parent padding 결합은 음수 margin 제거로 즉시 해소한다.
