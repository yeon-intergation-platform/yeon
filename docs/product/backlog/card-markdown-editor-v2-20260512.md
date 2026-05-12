# 카드 마크다운 에디터 v2 계획

## 배경

카드 작성 화면의 현재 에디터는 이미지 삽입 흐름이 충분히 안정적으로 느껴지지 않고, 툴바가 한국어 텍스트 버튼 중심이라 시각적으로 무겁다. 사용자는 `coding_stuffs/study-platform-client`의 공용 마크다운 에디터처럼 이미지 드래그앤드롭, 글자 사이 이미지 삽입, 이미지 크기 조절, 오른쪽 마크다운 preview를 갖춘 작성 경험을 원한다.

## 참고 구현

- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/markdown-editor.tsx`
  - TipTap `EditorContent` 기반 작성 영역
  - `handlePaste`, `handleDrop`에서 이미지/표/YouTube 입력 처리
  - 툴바는 `lucide-react` 아이콘과 접근성 label을 함께 관리
- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/use-image-upload.ts`
  - 이미지 파일 검증, 붙여넣기, Clipboard API, URL source 처리 분리
- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/extensions.ts`
  - `ResizableImageExtension`으로 이미지 width attribute 저장
  - node view에서 resize handle, width clamp, size label 처리
- `/home/osuma/coding_stuffs/study-platform-client/src/components/common/ui/editor/markdown-content.tsx`
  - 편집 결과를 preview에서 안전하게 렌더링

## 현재 Yeon 기준 관찰

- `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx`
  - 이미 TipTap 기반이며 본문 중간 이미지 삽입, 드롭, 붙여넣기, resize node view의 기초가 있다.
  - 다만 이미지 업로드/검증/붙여넣기 로직이 컴포넌트 안에 모여 있어 실패 경계와 테스트가 약하다.
  - 툴바 버튼이 `굵게`, `기울임`, `이미지` 같은 텍스트 중심이라 사용자가 지적한 것처럼 아이콘 기반 UI보다 둔하다.
  - 작성 영역 단일 화면이라 오른쪽 preview가 없다.
- `apps/web/src/features/card-service/components/markdown-content.tsx`
  - 카드 재생/보기용 렌더러가 있으므로 preview에도 재사용 가능하다.
- `apps/web/package.json`
  - TipTap, DOMPurify, heic2any, lucide-react 등 필요한 기본 의존성은 이미 있다.

## 1차 — 에디터 구조 분리와 아이콘 툴바 복구

### 작업내용

- `CardRichMarkdownEditor` 내부 로직을 작은 단위로 분리한다.
  - `card-editor-image-utils.ts`: 확장자, 크기, count, width clamp, validation
  - `use-card-editor-image-upload.ts`: upload/insert/paste/drop 상태와 에러 source of truth
  - `card-editor-extensions.ts`: `ResizableImageExtension`
  - `card-editor-toolbar.tsx`: 아이콘 기반 툴바 버튼
- 툴바는 텍스트 버튼 대신 아이콘 버튼을 기본으로 한다.
  - 화면에는 아이콘 중심으로 보이고, `aria-label`/`title`에 한국어 설명을 둔다.
  - 핵심 액션: undo, redo, bold, italic, underline, bullet, ordered, quote, image.
- 업로드 중 상태는 이미지 버튼 spinner와 하단 상태줄로만 보여준다.

### 논의 필요

- 아이콘만 표시할지, 데스크톱에서만 짧은 label을 같이 보일지.

### 선택지

- A. 모든 툴바 버튼을 아이콘 only로 변경한다.
- B. 아이콘 only + hover title/aria-label을 제공한다.
- C. 아이콘 + 텍스트를 유지하되 디자인만 줄인다.

### 추천

- B. 사용자가 명시적으로 “글자가 아니라 아이콘이 훨씬 예쁘고 직관적”이라고 했으므로 시각 표면은 아이콘 중심으로 두고 접근성 설명은 유지한다.

### 사용자 방향

- 아이콘 중심 툴바로 진행한다. 한국어 텍스트 버튼을 기본 표면으로 두지 않는다.

## 2차 — 이미지 삽입 실패 경계 강화

### 작업내용

- 이미지 입력 경로를 4개로 명확히 나눈다.
  - 파일 선택 버튼
  - 에디터 본문으로 드래그앤드롭
  - 이미지 파일/스크린샷 붙여넣기
  - Clipboard API fallback
- 모든 경로가 동일한 `handleImageFiles(editor, files)`를 사용하게 한다.
- validation 기준을 상수화한다.
  - 허용 확장자: jpg, jpeg, png, webp, gif, heic, heif 여부 검토
  - 최대 파일 크기: 기존 10MB 유지 또는 5MB로 축소 여부 결정
  - 카드 한 면 최대 이미지 수: 기존 20 유지 여부 결정
- 실패 메시지는 개별 파일명 단위로 누적하되, 업로드 성공분은 본문에 남긴다.
- 드롭 시 커서 위치에 삽입되는지 확인하고, 필요하면 TipTap drop position 보정 로직을 추가한다.

### 논의 필요

- HEIC/HEIF 변환을 카드 에디터에도 도입할지.
- 이미지 수 제한 20이 카드 학습 UX에 과한지.

### 선택지

- A. 현재 JPG/PNG/WEBP/GIF만 유지한다.
- B. study-platform-client처럼 HEIC/HEIF도 변환 지원한다.
- C. 우선 A로 안정화하고 별도 PR에서 B를 검토한다.

### 추천

- C. 지금 문제는 “첨부가 안 됨”과 작성 UX이므로 지원 포맷 확대보다 동일 경로/오류/테스트 안정화를 먼저 한다.

### 사용자 방향

- 이미지 첨부가 실제로 동작하는 것을 우선한다.

## 3차 — 본문 이미지 크기 조절 UX 정리

### 작업내용

- `ResizableImageExtension`을 별도 파일로 분리하고 테스트 가능한 순수 함수(`clampImageWidth`, `parseImageWidth`)를 둔다.
- 이미지 node view 요구사항을 고정한다.
  - 선택 시 outline 표시
  - 우하단 resize handle 표시
  - pointer move 중 즉시 preview width 반영
  - pointer up 때 TipTap node attr `width` 저장
  - 저장된 HTML `<img width="...">`가 보기/preview에서 유지됨
- mobile/touch에서는 handle이 너무 작지 않도록 hit area를 키운다.

### 논의 필요

- 카드 본문 최대 표시 폭을 800px, 900px 중 무엇으로 둘지.

### 선택지

- A. 기존 Yeon 기준 160~900px 유지
- B. study-platform-client 기준 200~800px로 통일
- C. 카드 컨테이너 폭에 맞춰 responsive clamp로 계산

### 추천

- B. 에디터/preview/재생 화면 간 과도한 이미지 폭 차이를 줄이고, 참고 구현과 동일한 예측 가능성을 가져간다.

### 사용자 방향

- 이미지 크기 조절이 저장 후 preview와 실제 카드 보기에서도 일관되게 보여야 한다.

## 4차 — 오른쪽 마크다운 preview 2-pane 구성

### 작업내용

- 카드 작성/수정 화면에서 데스크톱은 좌측 editor, 우측 preview 2-pane 레이아웃으로 구성한다.
- preview는 `MarkdownContent`를 재사용해 실제 카드 표시와 최대한 같은 렌더링을 사용한다.
- 모바일은 탭 또는 접기 방식으로 `작성`/`미리보기`를 전환한다.
- preview 영역은 다음 상태를 가진다.
  - 비어 있을 때 안내 문구
  - 업로드 중 이미지가 아직 삽입되지 않았을 때 pending 상태
  - HTML 기반 TipTap content와 기존 markdown 문자열 모두 렌더링

### 논의 필요

- preview를 카드 앞/뒤 에디터 각각 옆에 둘지, 현재 편집 중인 면 하나만 우측에 보여줄지.

### 선택지

- A. 앞면/뒷면 각각 editor 옆에 preview를 둔다.
- B. 카드 row 전체 오른쪽에 현재 focus된 면 preview 하나만 둔다.
- C. add form은 2-pane, card row edit는 접이식 preview로 둔다.

### 추천

- C. 새 카드 추가 화면은 넓게 쓰고, 카드 목록 row는 공간이 좁으므로 접이식 preview가 안전하다.

### 사용자 방향

- 오른쪽 preview가 떠야 한다. 단, 모바일은 좁으므로 전환 UI로 대체한다.

## 5차 — 회귀 테스트와 수동 smoke

### 작업내용

- 순수 함수 테스트를 추가한다.
  - 확장자 검증
  - 파일 크기 검증
  - 이미지 count 제한
  - width parse/clamp
- 컴포넌트 테스트 또는 Playwright smoke를 추가한다.
  - 이미지 파일 drop → 업로드 API 호출 → 본문 중간 이미지 삽입
  - paste image file → 삽입
  - resize handle drag → width attr 변경
  - preview가 같은 이미지/width를 렌더링
- 기존 단일 첨부 이미지와 새 본문 이미지가 같이 존재해도 보기 화면이 깨지지 않는지 확인한다.

### 논의 필요

- 이미지 업로드 API mock을 어느 테스트 레벨에서 둘지.

### 선택지

- A. unit 중심으로 빠르게 검증한다.
- B. Playwright 중심으로 실제 DnD/paste/resize를 검증한다.
- C. unit + Playwright smoke 1개를 같이 둔다.

### 추천

- C. 이미지 첨부 문제는 사용자 상호작용에서 깨지기 쉬우므로 최소 1개 실제 브라우저 smoke가 필요하다.

### 사용자 방향

- 기능이 실제로 잘 돌아가는지 우선한다.

## 완료 조건

- 툴바가 아이콘 중심으로 보이고 텍스트 버튼 나열이 사라진다.
- 이미지 파일 선택, 드래그앤드롭, 붙여넣기가 모두 본문 커서 위치에 이미지를 삽입한다.
- 삽입된 이미지는 본문 글자 사이에 위치한다.
- 이미지 width 조절이 가능하고 저장/preview/카드 보기에서 유지된다.
- 데스크톱 작성 화면 오른쪽에 preview가 보인다.
- 모바일 작성 화면에서도 preview 접근 경로가 있다.
- 실패 메시지는 한국어로 정확히 나오되, 툴바 표면은 아이콘 중심이다.
- `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `pnpm --filter @yeon/web build`가 통과한다.
