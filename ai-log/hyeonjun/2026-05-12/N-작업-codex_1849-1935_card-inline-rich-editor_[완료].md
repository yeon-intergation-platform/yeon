# 카드 상세 인라인 TipTap 편집 복구

- 시작: 2026-05-12 18:49 KST
- 브랜치: feat/card-inline-rich-editor-20260512
- 목표: 카드 상세 목록에서 카드 클릭 시 모달 없이 row 내부에서 질문/답변을 TipTap 리치 에디터로 수정한다.
- 주의: 기존 미소유 변경 `apps/backend/src/test/java/world/yeon/backend/chat_service_friend_requests/chat_service_my_profile/controller/ChatServiceMyProfileControllerTests.java`는 건드리거나 stage하지 않는다.

## 계획

1. `CardRow` 모달 편집 제거 및 인라인 편집 상태 구현.
2. 카드 전용 TipTap 에디터/이미지 업로드/리사이즈 구현.
3. `MarkdownContent` HTML sanitize 렌더링 추가.
4. 추가 폼 이미지 aside 제거 및 에디터 안 이미지 삽입으로 통일.
5. typecheck/lint/build/diff 검증 후 main PR/merge.

## 진행

- 백로그: `docs/product/backlog/card-inline-rich-editor-20260512.md`

## 완료 내용

- `CardRow`의 `EditCardDialog` 모달 수정 흐름을 제거하고 row 내부 인라인 편집으로 교체했다.
- 질문/답변 공용 `CardRichMarkdownEditor`를 추가해 TipTap 기반 편집, 이미지 드래그앤드롭/붙여넣기/파일 업로드, 이미지 width 리사이즈를 지원했다.
- 카드 추가 폼의 우측 단일 이미지 첨부 aside를 제거하고, 이미지 삽입을 에디터 내부 방식으로 통일했다.
- `MarkdownContent`에 HTML 감지 + DOMPurify sanitize 렌더링을 추가해 기존 Markdown과 신규 TipTap HTML을 함께 표시한다.
- 기존 `imageStorageKey/imageUrl` 단일 첨부 이미지는 보기 화면에 유지하고, 수정 저장 body에서는 `imageStorageKey`를 생략해 삭제되지 않게 했다.
- 본문 HTML 이미지 URL 저장을 고려해 카드 텍스트 계약/게스트 병합 trim 한도를 20,000자로 확장했다.

## 검증

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `pnpm --filter @yeon/api-contract typecheck` 통과
- `pnpm --filter @yeon/api-contract lint` 통과
- `apps/backend ./gradlew compileJava` 통과
- `git diff --check`는 소유 변경 파일 범위로 통과

## 미소유 변경

다음 변경은 이 작업 전/중 다른 작업 변경으로 판단하여 stage하지 않는다.

- `apps/backend/src/test/java/world/yeon/backend/chat_service_friend_requests/chat_service_my_profile/controller/ChatServiceMyProfileControllerTests.java`
- `apps/web/src/features/community/components/community-chat-widget.tsx`
- `docs/product/backlog/community-chat-collapse-motion-20260512.md`
- `ai-log/hyeonjun/2026-05-12/N-작업-codex_1851-작업중_community-chat-collapse-exit-direction_[작업중].md`
