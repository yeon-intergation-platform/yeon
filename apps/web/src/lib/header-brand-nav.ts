import { PLATFORM_HOME_HREF } from "./platform-services";

/**
 * 서비스/콘텐츠 헤더 좌상단 브랜드 링크의 "한 단계 위" 이동 경로를 결정한다.
 *
 * 원칙: 하위 화면 → 서비스 홈, 서비스 홈 → 플랫폼(yeon.world).
 *
 * `useYeonPathname()`(= next usePathname)는 환경에 따라 다른 경로를 준다:
 * - subdomain(canonical, 예: card.yeon.world/decks) → prefix 없는 `/decks`
 * - root/dev domain(예: yeon.world 또는 localhost/card-service/decks) → prefix 포함 `/card-service/decks`
 *
 * 두 경우를 pathname 만으로 구분한다(host 불필요). subdomain에서 플랫폼으로
 * 나갈 때만 다른 도메인이라 절대 URL(PLATFORM_HOME_HREF)이 필요하다.
 */
export function resolveSectionBrandHref(
  basePath: string,
  pathname: string | null | undefined,
  platformHref: string = PLATFORM_HOME_HREF
): string {
  const path = pathname ?? "/";
  const hasPrefix = path === basePath || path.startsWith(`${basePath}/`);

  if (hasPrefix) {
    // root/dev domain: 경로에 서비스 prefix가 붙어 있다.
    const isSectionHome = path === basePath || path === `${basePath}/`;
    return isSectionHome ? "/" : basePath;
  }

  // subdomain: prefix 없는 경로. "/"가 곧 서비스 홈이다.
  const isSectionHome = path === "/";
  return isSectionHome ? platformHref : "/";
}
