# 4. 카드 에디터 작성 코드블록 언어 선택 UI (완료)

## 작업시간
- 2026-06-06 15:27 ~ 15:36

## 목적
- 카드 작성 에디터의 코드블록 내부에서 언어를 드롭다운으로 설정할 수 있게 한다.
- 기존 미리보기 언어 선택/하이라이트 구현을 작성 패널에서도 일관되게 사용할 수 있게 한다.

## 차수
### 차수 1
- 작업내용
  - `card-rich-markdown-editor`의 Tiptap codeBlock 렌더링 경로를 확인한다.
  - 작성 코드블록용 NodeView 또는 동등한 UI를 추가한다.
  - 언어 선택 시 `language` attr이 저장되어 마크다운 fence와 미리보기에 반영되는지 검증한다.
- 논의 필요
  - 없음
- 선택지
  - A. 미리보기에서만 언어 선택 유지
  - B. 작성 코드블록 자체에 언어 드롭다운 추가
- 추천
  - B
- 사용자 방향
  - "그렇게 해봐"에 따라 B로 구현

## 구현 결과
- 작성 에디터의 Tiptap codeBlock에 DOM NodeView를 추가해 코드블록 내부 헤더에 언어 드롭다운을 표시.
- 언어 변경 시 `codeBlock.attrs.language`를 갱신하고 저장 HTML에 `language-javascript` 같은 class가 남도록 처리.
- 기존 미리보기/마크다운 하이라이트 언어 목록을 재사용.
- lint 제한에 맞춰 `@tiptap/extension-code-block`은 `@yeon/ui/rich-content/YeonTiptap` wrapper로 노출.

## 검증
- `pnpm install --frozen-lockfile --filter @yeon/ui --filter @yeon/web` 통과
- `pnpm --filter @yeon/ui lint` 통과
- `pnpm --filter @yeon/ui typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `git diff --check` 통과
- `pnpm build:web` 통과
- Playwright 시스템 Chrome 스모크:
  - 작성 코드블록 select 표시 확인
  - `code -> javascript` 변경 확인
  - 저장 후 IndexedDB `frontText`에 `<pre><code class="language-javascript">...` 반영 확인

## 참고
- 로컬 dev 서버만 기동했고 검증 후 종료.
- 백엔드 미기동 상태라 dev 서버 로그에 커뮤니티/타자 보조 API 503/500이 있었지만 카드 코드블록 스모크 대상은 통과.
