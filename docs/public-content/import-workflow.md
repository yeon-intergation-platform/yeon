# 공개 콘텐츠 import workflow

상세 운영 절차의 SSOT는 [`../seo/public-content-import-workflow.md`](../seo/public-content-import-workflow.md)이다.

작성자는 원고를 `docs/public-content/articles/`에 두고, 발행 전 아래 명령을 통과시킨다.

```bash
pnpm --filter @yeon/web public-content:import:dry-run
```

운영 원칙:

- frontmatter는 `@yeon/api-contract/public-content` 원고 contract schema를 따른다.
- dry-run 결과의 실패는 모두 수정한 뒤 발행 후보로 넘긴다.
- 경고는 의도 여부를 확인하고 필요하면 본문이나 source path를 보강한다.
- `/admin/content`는 import dry-run 통과 여부를 확인하는 운영 화면이며, 현 단계에서 직접 수정/삭제/발행 버튼을 맡지 않는다.
- 발행 후에는 host별 sitemap에 URL이 포함됐는지 확인한다.
