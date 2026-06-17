# Support FAQ와 해결 단계 구조

## 8차: support 본문 구조 마무리

논의 필요: support 글 첫 화면에서 설명 문단을 먼저 둘지, 실제 해결 단계 요약을 먼저 보여줄지.  
선택지: 기존 본문 순서 유지, 첫 action block 요약 노출, 모든 글 수동 lead block 추가.  
추천: 본문 원문은 유지하되 첫 `steps` 또는 `checklist` block에서 최대 3개 항목을 파생해 본문 위에 노출한다.  
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. support FAQ 글은 accordion보다 색인 가능한 `heading` block을 우선한다.
2. heading이 없는 support FAQ 글을 찾아 heading 구조로 보강한다.
3. support article의 첫 `steps` 또는 `checklist`에서 주요 확인 항목을 파생한다.
4. article detail에서 support 주요 확인 항목을 본문 위에 노출한다.
5. support가 아닌 news/blog 글에는 주요 확인 항목 요약을 만들지 않는다.
6. 공개 콘텐츠 audit에서 support FAQ heading 구조를 검증한다.
7. 공개 콘텐츠 audit에서 support 글의 action block 존재를 검증한다.
8. 단위 테스트와 브라우저 검증으로 desktop/mobile 레이아웃을 확인한다.

진행 결과: 완료. support FAQ는 heading block 구조를 audit로 검증하고, support article detail은 첫 action block에서 파생한 주요 확인 항목을 본문 위에 노출한다.
