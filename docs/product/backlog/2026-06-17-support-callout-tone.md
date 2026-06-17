# Support callout 상태 표현

## 8차: 공개 콘텐츠 본문 상태 박스 보강

논의 필요: support 문서의 주의/완료 박스를 색으로 얼마나 강하게 구분할지.  
선택지: 모두 회색 유지, 빨간 경고/녹색 성공 사용, 조용한 주의/성공 tone만 추가.  
추천: 빨간색은 남용하지 않고, 주의는 낮은 채도의 노란 계열 경계선과 배경으로 구분하며, 완료는 조용한 녹색 계열로 제한한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. 공개 콘텐츠 callout block에 `note`, `warning`, `success` tone을 추가한다.
2. tone이 없으면 기존 회색 note 스타일을 유지한다.
3. warning 스타일은 빨간색을 쓰지 않고 경계선과 배경으로만 주의를 표현한다.
4. success 스타일은 조용한 녹색 계열로 제한한다.
5. support 문서의 실제 주의성 callout에 warning tone을 지정한다.
6. 설치 완료 상태를 표현하는 success callout을 추가한다.
7. audit에서 callout tone 허용값을 검증한다.
8. 단위 테스트와 공개 콘텐츠 audit로 회귀를 막는다.

진행 결과: 완료. `support` callout은 `note`, `warning`, `success` tone을 지원하며, warning은 빨간색을 쓰지 않고 success는 조용한 녹색 계열로 제한한다.
