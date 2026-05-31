# subdomain host routing 작업 로그

## 목표

- 사용자가 Cloudflare Tunnel public hostname 설정을 완료한 뒤, 앱에서 host 기반 rewrite를 구현한다.
- 신규 subdomain을 서비스 canonical URL로 문서화하고 검증한다.

## 사용자 완료 항목

- `typing.yeon.world` `*` -> `http://yeon-prod-web:3000`
- `card.yeon.world` `*` -> `http://yeon-prod-web:3000`
- `community.yeon.world` `*` -> `http://yeon-prod-web:3000`

## 제약

- 기존 path URL은 즉시 redirect하지 않고 호환 유지한다.
- API/auth/static asset 요청은 host rewrite 대상에서 제외한다.
- 다른 에이전트의 기존 미커밋 변경은 건드리지 않는다.

## 검증 예정

- `pnpm --filter @yeon/web test src/lib/__tests__/subdomain-routing.test.ts src/lib/__tests__/seo.test.ts`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 운영 curl smoke

## 구현 결과

- `apps/web/src/proxy.ts`에 service subdomain host rewrite를 추가했다.
- `apps/web/src/lib/subdomain-routing.ts`에 host/path rewrite source of truth를 추가했다.
- 서비스 canonical/JSON-LD/sitemap URL을 신규 subdomain 기준으로 변경했다.
- Cloudflare 설정 완료 상태를 `docs/deployment/domain-routing.md`에 기록했다.

## 검증 결과

- `pnpm --filter @yeon/web test src/lib/__tests__/subdomain-routing.test.ts src/lib/__tests__/seo.test.ts` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- 배포 전 curl smoke: 신규 subdomain 3개와 기존 path 3개 모두 HTTP 200

## 남은 확인

- main 배포 후 신규 subdomain이 각 서비스 화면으로 rewrite되는지 운영 smoke test 필요.
- 기존 path URL은 이번 차수에서 redirect하지 않고 호환 유지한다.
