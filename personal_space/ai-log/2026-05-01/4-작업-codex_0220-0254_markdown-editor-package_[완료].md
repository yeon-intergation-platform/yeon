# 작업-codex | 카드 마크다운 편집기 패키지 적용

- 주체: Codex CLI
- 워크트리: A (/home/osuma/coding_stuffs/yeon)
- 브랜치: fix/card-markdown-editor-package-1
- 작업창(예상): 02:20 ~ 03:00
- 실제 시작: 02:20
- 실제 종료: 02:54
- 상태: 완료

## 파일·디렉토리 범위 (whitelist)
- apps/web/package.json
- pnpm-lock.yaml
- apps/web/src/app/layout.tsx
- apps/web/src/features/card-service/components/markdown-editor.tsx
- apps/web/src/features/card-service/components/markdown-content.tsx (필요 시)
- personal_space/ai-log/2026-05-01/4-작업-codex_0220-0254_markdown-editor-package_[완료].md

## 절대 건드리지 않을 범위 (상대 주체 담당)
- output/ 및 기존 untracked 로그
- card-service 외 타 기능 UI/DB

## 상대 주체 현황 스냅샷
- 1,2,3번 로그 완료 상태.
- main에는 PR #170, #172 반영 완료. 배포 workflow #25179311447는 확인 중.

## 차수별 작업내용
1. @uiw/react-md-editor 도입 여부 확인 및 패키지 설치
2. 카드 추가/편집 MarkdownEditor를 패키지 기반 편집기로 교체
3. lint/typecheck/build/Playwright 검증
4. PR 생성 및 main 머지


## 완료 내용
- `@uiw/react-md-editor`와 `@uiw/react-markdown-preview`를 웹 앱 의존성에 추가했다.
- 카드 추가/편집 MarkdownEditor를 패키지 기반 에디터로 교체하고, SSR 비활성 dynamic import로 클라이언트 전용 처리했다.
- 마크다운 에디터/프리뷰 CSS를 앱 레이아웃에서 불러오고, YEON 카드 톤에 맞춘 전역 scoped 스타일을 추가했다.
- previewOptions에서 script/style/iframe/object/embed/link/meta를 disallow 처리했다.

## 검증
- `pnpm install`
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web lint` ✅
- `pnpm --filter @yeon/web build` ✅ (Next 16.2.4, 97 static pages)
- Playwright local: `http://localhost:3000/card-service/decks/e2e-md-editor-package` ✅
  - editorCount=2
  - toolbarButtonCount=52
  - storedIncludesTable=true
  - hasMarkdownEditorPackage=true
  - hasExistingMarkdownTableRenderedBeforeAdd=true
  - renderedTableCount=2
  - hasRenderedMarkdownCodeBlock=true
  - consoleErrors=[] / pageErrors=[]

## 남은 리스크
- `output/` Playwright 산출물은 검증 증거용 로컬 파일로 커밋하지 않음.
- Next build의 `NO_COLOR`/`postcss.config.js MODULE_TYPELESS_PACKAGE_JSON` 경고는 기존 경고로 이번 변경 범위 밖.
