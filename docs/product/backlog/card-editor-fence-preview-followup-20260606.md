# 카드 편집 markdown fence 미리보기 보강 백로그

## 1차수

### 작업내용

- 카드 inline/add 편집에서 HTML paragraph 안에 남은 markdown code fence를 미리보기 코드블록 UI로 렌더링한다.
- 기존 표시 카드와 동일하게 언어 dropdown, copy 버튼, 문법 하이라이트가 보이게 한다.
- 편집 패널이 실제 codeBlock 노드를 가질 때 `코드 블록` 시각 표시가 유지되는지 검증한다.

### 논의 필요

- 사용자가 markdown fence를 직접 타이핑한 경우 Tiptap document를 즉시 codeBlock 노드로 변환할지, 미리보기 렌더링에서만 codeBlock으로 해석할지 결정이 필요하다.

### 선택지

1. 미리보기 렌더링에서 HTML paragraph fence를 codeBlock으로 해석한다.
2. editor input rule을 추가해 fence 타이핑 즉시 codeBlock 노드로 변환한다.
3. 저장 직전 serializer만 정리한다.

### 추천

- 1번을 우선 적용한다. 현재 목표는 흔들림 없는 카드 저장/추가 모달과 미리보기 언어 선택/하이라이트이며, editor input rule은 입력 중 커서/상태 전이 리스크가 더 크다.

### 사용자 방향

- 비어 있으면 추천 기준으로 진행한다.
