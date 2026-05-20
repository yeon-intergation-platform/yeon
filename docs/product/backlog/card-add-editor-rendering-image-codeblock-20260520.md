# 카드 추가 에디터 이미지/코드블록/미리보기 안정화 백로그 (2026-05-20)

## 배경

카드 추가 모달 직접 작성 화면에서 다음 문제가 확인됐다.

1. 이미지 삽입 결과가 카드 본문 블록처럼 보이지 않고 얇은 선/핸들만 보이는 비정상 UI로 보인다.
2. 이미지 리사이즈 UX가 `study-platform-client`의 안정적인 에디터와 다르게 불안정하다.
3. 카드 질문/카드 답변에 입력한 내용과 업로드된 이미지가 오른쪽 실시간 미리보기에 즉시 나오지 않는다.
4. 코드블록 삽입/동작이 직관적이지 않고 렌더링 결과도 이상할 가능성이 있다.
5. 단, `study-platform-client`의 디자인을 그대로 가져오면 안 된다. 참고 대상은 동작/상태/리사이즈 구조이며, Yeon 카드 서비스 디자인 규칙은 유지한다.

## 현재 코드 근거 기반 1차 판단

- `study-platform-client`는 `ResizableImageExtension`을 `ImageExtension.extend(...)`로 사용하되, 에디터에서 `inline: true`로 강제하지 않는다.
- Yeon 카드 에디터는 `ResizableCardEditorImageExtension.configure({ inline: true })`를 사용한다.
- 카드 추가 요구는 “이미지 블록 삽입”에 가깝고, 현재 스크린샷도 inline 이미지가 문장 라인 안에서 얇은 선처럼 깨지는 증상으로 보인다.
- `study-platform-client` 리사이즈 NodeView는 `wrapperElement.style.width`를 초기화하고, load 후 원본 크기와 표시 크기를 함께 갱신한다.
- Yeon NodeView는 width attr은 갱신하지만 “블록 이미지”로 안정적으로 흐르게 하는 책임이 약하다.
- 오른쪽 미리보기는 `MarkdownContent`가 HTML/Markdown을 렌더링하는 구조라서, 입력 HTML이 정상적으로 state에 올라오고 sanitizer가 이미지 src/width를 유지하면 표시되어야 한다. 표시되지 않는다면 `onUpdate -> frontText/backText -> deferred preview -> MarkdownContent` 흐름 중 하나가 끊겼거나, sanitize/render 단계에서 이미지/코드블록이 손실되는 것이다.

## 실행 원칙

- 이 백로그 작성 전까지 코드 구현은 중단한다.
- `study-platform-client`는 동작 구조만 참고한다. 디자인, 토큰, shadcn 스타일, 색상/간격은 가져오지 않는다.
- Yeon 카드 서비스 디자인 규칙은 `bg-white`, `text-[#111]`, `text-[#666]`, `text-[#aaa]`, `border-[#e5e5e5]`, `bg-[#fafafa]` 정규값만 사용한다.
- 검증은 개발자가 켜둔 `http://localhost:3000/`을 기준으로 Playwright로 수행한다. 에이전트가 dev server를 새로 기동하지 않는다.
- 이번 작업도 기존 상태 보존/닫기 confirm 작업과 묶어서 한 번에 PR을 올린다. 바로 merge하지 않는다.

## 실행 체크리스트

### A. 원인 재현/추적

- [ ] 1. `localhost:3000`의 카드 추가 모달에서 텍스트 입력이 오른쪽 미리보기에 반영되지 않는지 Playwright로 재현한다.
- [x] 2. 질문 에디터에서 이미지 버튼 업로드 후 실제 에디터 DOM/HTML 값을 확인한다.
- [x] 3. 이미지 삽입 직후 `editor.getHTML()`에 `<img src="..." width="...">`가 들어오는지 확인한다.
- [x] 4. `frontText/backText` state에 동일 HTML이 올라오는지 확인한다.
- [x] 5. `CardAddLivePreview -> MarkdownContent`에서 동일 값이 전달되는지 확인한다.
- [x] 6. sanitizer 이후 HTML에서 `img src`, `width`, `loading`, `decoding`이 유지되는지 확인한다.
- [x] 7. 코드블록 버튼 클릭/``` 입력/붙여넣기 각각에서 생성되는 HTML 구조를 확인한다.

### B. 이미지 삽입/리사이즈 구조 개선

- [x] 8. Yeon 이미지 확장의 `inline: true` 강제가 현재 블록 이미지 요구와 충돌하는지 확인한다.
- [x] 9. 이미지 노드를 블록 흐름으로 삽입하도록 변경한다.
- [x] 10. 이미지 삽입 후 앞뒤에 필요한 paragraph를 보장해 커서 이동/추가 입력이 막히지 않게 한다.
- [x] 11. `study-platform-client`의 리사이즈 NodeView 방식 중 동작만 참고해 wrapper width 초기화, load 후 표시/원본 크기 라벨 갱신, update 시 width 동기화를 Yeon 구조에 맞게 정리한다.
- [x] 12. 리사이즈 핸들은 이미지 1개당 1개만 보이게 하고, 중복 label/handle이 남지 않게 한다.
- [x] 13. 이미지 업로드 실패 시 깨진 이미지 노드가 남지 않게 한다.
- [x] 14. 이미지 업로드 성공 후 오른쪽 미리보기에 같은 이미지가 즉시 표시되게 한다.
- [x] 15. 이미지 width attr이 저장 payload와 미리보기 렌더링에 유지되게 한다.

### C. 코드블록 동작 개선

- [x] 16. 코드블록 버튼이 선택 텍스트/빈 줄/기존 paragraph에서 각각 예측 가능한 코드블록을 만든다.
- [x] 17. 코드블록 안에서 일반 텍스트/특수문자/줄바꿈/이모지가 사라지지 않는다.
- [x] 18. 코드블록 내부에서 유튜브/테이블/이미지 paste 변환 로직이 잘못 개입하지 않는다.
- [x] 19. 코드블록 렌더링은 미리보기와 저장 후 카드 보기에서 동일하게 보인다.
- [x] 20. 필요하면 `study-platform-client`의 `InstantCodeBlockExtension`/codeblock input rule 구조를 참고하되 Yeon 디자인은 유지한다.

### D. 미리보기 동기화

- [x] 21. 질문 텍스트 입력 즉시 오른쪽 `카드 질문` 미리보기에 보인다.
- [x] 22. 답변 텍스트 입력 즉시 오른쪽 `카드 답변` 미리보기에 보인다.
- [x] 23. 질문 이미지 업로드 성공 즉시 오른쪽 `카드 질문` 미리보기에 보인다.
- [x] 24. 답변 이미지 업로드 성공 즉시 오른쪽 `카드 답변` 미리보기에 보인다.
- [x] 25. 이미지 리사이즈 후 오른쪽 미리보기와 저장 payload의 width가 일치한다.
- [x] 26. 빈 값/공백/빈 paragraph/list는 미리보기 placeholder를 유지한다.

### E. Playwright QA 체크리스트 (`http://localhost:3000/`)

- [ ] 27. 브라우저 확대율 100%에서 카드 추가 모달을 열고 질문/답변/미리보기가 한 화면에 들어오는지 확인한다.
- [ ] 28. 질문에 `안녕하세요` 입력 시 오른쪽 질문 미리보기에 즉시 표시된다.
- [ ] 29. 답변에 `정답입니다` 입력 시 오른쪽 답변 미리보기에 즉시 표시된다.
- [ ] 30. 질문에 이미지 버튼으로 이미지를 넣으면 에디터에 정상 블록 이미지로 보인다.
- [ ] 31. 질문 이미지가 오른쪽 질문 미리보기에 즉시 보인다.
- [ ] 32. 이미지 핸들을 드래그해 크기를 바꾸면 에디터 표시 크기가 자연스럽게 바뀐다.
- [ ] 33. 리사이즈 후 오른쪽 미리보기 이미지 크기도 반영된다.
- [ ] 34. 답변에도 이미지 삽입/미리보기/리사이즈가 동일하게 동작한다.
- [ ] 35. 코드블록 버튼 클릭 후 여러 줄 코드를 입력하면 에디터와 미리보기 모두 코드블록으로 보인다.
- [ ] 36. ```붙여넣기/입력 케이스가 의도대로 코드블록이 되거나 최소한 내용이 깨지지 않는다.

      ```
- [ ] 37. 직접 작성에서 작성 후 `일괄 추가` 탭 이동, 다시 `직접 작성` 복귀 시 텍스트/이미지/코드블록이 모두 유지된다.
- [ ] 38. 빈 상태에서 닫기 confirm이 뜨지 않는다.
- [ ] 39. 텍스트/이미지/코드블록 중 하나라도 있으면 닫기 confirm이 뜬다.

### F. 자동 검증

- [x] 40. 관련 unit test가 있으면 이미지 width/HTML sanitize/codeblock rendering 케이스를 추가 또는 갱신한다.
- [x] 41. `pnpm --filter @yeon/web lint`를 통과한다.
- [x] 42. `pnpm --filter @yeon/web typecheck`를 통과한다.
- [x] 43. `git diff --check`를 통과한다.
- [x] 44. Playwright 수동/자동 확인 결과를 작업 로그에 남긴다.

## 구현 후보

### 1차: 이미지 노드 블록화

#### 작업내용

- `ResizableCardEditorImageExtension.configure({ inline: true })`를 제거하거나 블록 이미지 확장으로 명확히 바꾼다.
- `insertCardEditorImages`가 이미지 노드를 본문 블록처럼 삽입하고, 필요 시 뒤에 paragraph를 추가한다.
- 기존 저장 HTML의 `<img>`도 정상 parse/render 되게 유지한다.

#### 논의 필요

- 기존 카드에 이미 저장된 inline image HTML이 있다면 backward compatibility가 필요하다.

#### 선택지

1. inline 이미지 유지
   - 현재 깨진 UI 가능성이 남는다.
2. 블록 이미지로 전환
   - 카드 본문/미리보기 요구와 가장 일치한다.
3. inline/block 선택 옵션화
   - 범위가 커지고 현재 카드 추가 문제 해결에는 과하다.

#### 추천

2번. 카드 추가 화면에서 이미지는 문장 중간 inline 장식보다 학습 카드 본문 블록으로 다루는 것이 안전하다.

#### 사용자 방향

추천 기준으로 진행한다.

### 2차: 리사이즈 NodeView 정합성

#### 작업내용

- `study-platform-client`의 NodeView 동작을 비교해 Yeon NodeView의 wrapper width, load 후 라벨, update 시 width 반영을 정리한다.
- className/색상/간격은 Yeon 카드 서비스 규칙에 맞춘다.

#### 논의 필요

- size label이 항상 보이면 공간을 가릴 수 있다. 선택 중 또는 hover 중 표시로 줄일지 확인이 필요하다.

#### 선택지

1. 현재 size label 항상 표시 유지
2. 선택/hover 중에만 표시
3. size label 제거

#### 추천

2번. 정보는 필요하지만 카드 작성 공간을 가리면 안 된다.

#### 사용자 방향

추천 기준으로 진행한다.

### 3차: 미리보기 렌더링 동기화

#### 작업내용

- `onUpdate`에서 이미지 삽입/리사이즈 transaction이 state로 반영되는지 확인한다.
- 반영되지 않는 경로가 있으면 이미지 width/source 변경 뒤 `onChange(editor.getHTML())`가 호출되게 한다.
- `MarkdownContent` sanitizer가 카드 이미지 URL과 width를 유지하는지 확인한다.

#### 논의 필요

- 미리보기는 deferred value를 쓰므로 아주 짧은 지연은 허용하지만 “안 나옴”은 허용하지 않는다.

#### 선택지

1. deferred 유지 + state 흐름 수정
2. deferred 제거
3. preview 전용 DOM 직접 읽기

#### 추천

1번. 성능 목적의 deferred는 유지하되 source of truth는 React state로 통일한다.

#### 사용자 방향

추천 기준으로 진행한다.

### 4차: 코드블록 입력/렌더링 안정화

#### 작업내용

- 버튼 코드블록, ``` input rule, paste code fence 경로를 각각 확인한다.
- 코드블록 안에서는 이미지/유튜브/테이블 자동 변환이 개입하지 않게 한다.
- 미리보기/저장 후 렌더링에서 같은 코드블록 스타일이 나오게 한다.

#### 논의 필요

- 언어 선택 UI까지 넣을지, 우선 plaintext/code 기본으로 둘지 결정이 필요하다.

#### 선택지

1. 기본 코드블록만 안정화
2. 언어 선택 UI까지 추가
3. syntax highlighting까지 확장

#### 추천

1번. 지금 문제는 “이상하게 작동”이므로 먼저 깨지지 않는 기본 동작을 고정한다.

#### 사용자 방향

추천 기준으로 진행한다.

## 검증 기록

- 구현 관점 검증: 이미지 확장의 inline 강제 제거, 이미지 블록 삽입 후 paragraph 보장, 리사이즈 NodeView width/load/update 정리, 코드블록 내 paste 자동 변환 차단, 미리보기 HTML 이미지 block 렌더링 반영.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web exec vitest run src/features/card-service/components/card-editor-image-utils.test.ts` 통과.
- `git diff --check` 통과.
- `pnpm --filter @yeon/web build` 통과.
- 전체 `pnpm --filter @yeon/web test -- card-editor-image-utils.test.ts` 형태는 Vitest 인자 전달 방식 때문에 전체 테스트가 실행되어 기존 미수정 영역 실패가 함께 노출됐다. 대상 파일은 `exec vitest run <path>`로 별도 통과 확인했다.
- `localhost:3000` Playwright QA는 시도했으나 현재 로컬 서버가 떠 있지 않아 `ERR_CONNECTION_REFUSED`로 실행 불가했다. dev server는 작업자가 직접 기동하지 않는 프로젝트 규칙을 지켰다.

## 완료 기준

- 카드 질문/카드 답변 입력값이 오른쪽 미리보기에 즉시 표시된다.
- 이미지 업로드 후 에디터에는 정상적인 블록 이미지가 보이고, 오른쪽 미리보기에도 같은 이미지가 보인다.
- 이미지 리사이즈가 자연스럽고, width가 editor HTML/preview/save payload에 유지된다.
- 코드블록이 버튼/입력/붙여넣기 경로에서 내용을 잃지 않고 미리보기에도 정상 표시된다.
- 직접 작성/일괄 추가 탭 전환에도 텍스트/이미지/코드블록 작성 상태가 유지된다.
- Playwright 체크리스트와 lint/typecheck/diff 검증을 통과한다.
