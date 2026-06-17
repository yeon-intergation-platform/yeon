import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

type StructuredDataExpectation = {
  expectedType: string;
  expectedName: string;
};

type PublicContentPageCase = {
  path: string;
  heading: string;
  canonical: string;
  descriptionIncludes: string;
  structuredData: StructuredDataExpectation;
};

type PublicContentHostCase = {
  host: string;
  homeCanonical: string;
  homeHeading: string;
  collectionPath: string;
  collectionCanonical: string;
  articlePath: string;
  articleCanonical: string;
  articleHeading: string;
  sitemapUrl: string;
  homeStructuredData: StructuredDataExpectation;
  articleStructuredData: StructuredDataExpectation;
};

type AnalyticsWindow = Window & {
  __yeonAnalyticsEvents?: unknown[][];
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const PUBLIC_CONTENT_PAGE_CASES: readonly PublicContentPageCase[] = [
  {
    path: "/support",
    heading: "필요한 해결 방법을 서비스별로 찾으세요",
    canonical: "https://support.yeon.world/",
    descriptionIncludes: "공개 도움말",
    structuredData: {
      expectedType: "CollectionPage",
      expectedName: "YEON Support",
    },
  },
  {
    path: "/news",
    heading: "YEON의 공식 소식과 제품 변경사항",
    canonical: "https://news.yeon.world/",
    descriptionIncludes: "공식 공지",
    structuredData: {
      expectedType: "CollectionPage",
      expectedName: "YEON News",
    },
  },
  {
    path: "/blog",
    heading: "제품을 만들며 남기는 기술과 결정의 기록",
    canonical: "https://blog.yeon.world/",
    descriptionIncludes: "개발 일지",
    structuredData: {
      expectedType: "CollectionPage",
      expectedName: "YEON Blog",
    },
  },
  {
    path: "/support/nexa/guides/add-nexa-discord-bot",
    heading: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    canonical: "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
    descriptionIncludes: "디스코드 서버 관리자",
    structuredData: {
      expectedType: "Article",
      expectedName: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    },
  },
  {
    path: "/support/nexa/guides",
    heading: "NEXA 가이드",
    canonical: "https://support.yeon.world/nexa/guides",
    descriptionIncludes: "NEXA 가이드",
    structuredData: {
      expectedType: "CollectionPage",
      expectedName: "NEXA 가이드",
    },
  },
  {
    path: "/news/notice/support-open",
    heading: "YEON support.yeon.world 오픈 안내",
    canonical: "https://news.yeon.world/notice/support-open",
    descriptionIncludes: "support.yeon.world",
    structuredData: {
      expectedType: "NewsArticle",
      expectedName: "YEON support.yeon.world 오픈 안내",
    },
  },
  {
    path: "/news/updates/nexa",
    heading: "NEXA 제품 업데이트",
    canonical: "https://news.yeon.world/updates/nexa",
    descriptionIncludes: "NEXA 제품 업데이트",
    structuredData: {
      expectedType: "CollectionPage",
      expectedName: "NEXA 제품 업데이트",
    },
  },
  {
    path: "/blog/engineering",
    heading: "기술 글",
    canonical: "https://blog.yeon.world/engineering",
    descriptionIncludes: "기술 글",
    structuredData: {
      expectedType: "CollectionPage",
      expectedName: "기술 글",
    },
  },
  {
    path: "/blog/product/nexa-discord-server-operator-design",
    heading: "NEXA를 Discord 서버 운영자 관점에서 설계하는 이유",
    canonical:
      "https://blog.yeon.world/product/nexa-discord-server-operator-design",
    descriptionIncludes: "Discord 서버 운영자",
    structuredData: {
      expectedType: "BlogPosting",
      expectedName: "NEXA를 Discord 서버 운영자 관점에서 설계하는 이유",
    },
  },
];

const PUBLIC_CONTENT_HOST_CASES: readonly PublicContentHostCase[] = [
  {
    host: "support.yeon.world",
    homeCanonical: "https://support.yeon.world/",
    homeHeading: "필요한 해결 방법을 서비스별로 찾으세요",
    collectionPath: "/nexa/guides",
    collectionCanonical: "https://support.yeon.world/nexa/guides",
    articlePath: "/nexa/guides/add-nexa-discord-bot",
    articleCanonical:
      "https://support.yeon.world/nexa/guides/add-nexa-discord-bot",
    articleHeading: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    sitemapUrl: "https://support.yeon.world/sitemap.xml",
    homeStructuredData: {
      expectedType: "CollectionPage",
      expectedName: "YEON Support",
    },
    articleStructuredData: {
      expectedType: "Article",
      expectedName: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    },
  },
  {
    host: "news.yeon.world",
    homeCanonical: "https://news.yeon.world/",
    homeHeading: "YEON의 공식 소식과 제품 변경사항",
    collectionPath: "/updates/nexa",
    collectionCanonical: "https://news.yeon.world/updates/nexa",
    articlePath: "/notice/support-open",
    articleCanonical: "https://news.yeon.world/notice/support-open",
    articleHeading: "YEON support.yeon.world 오픈 안내",
    sitemapUrl: "https://news.yeon.world/sitemap.xml",
    homeStructuredData: {
      expectedType: "CollectionPage",
      expectedName: "YEON News",
    },
    articleStructuredData: {
      expectedType: "NewsArticle",
      expectedName: "YEON support.yeon.world 오픈 안내",
    },
  },
  {
    host: "blog.yeon.world",
    homeCanonical: "https://blog.yeon.world/",
    homeHeading: "제품을 만들며 남기는 기술과 결정의 기록",
    collectionPath: "/engineering",
    collectionCanonical: "https://blog.yeon.world/engineering",
    articlePath: "/product/nexa-discord-server-operator-design",
    articleCanonical:
      "https://blog.yeon.world/product/nexa-discord-server-operator-design",
    articleHeading: "NEXA를 Discord 서버 운영자 관점에서 설계하는 이유",
    sitemapUrl: "https://blog.yeon.world/sitemap.xml",
    homeStructuredData: {
      expectedType: "CollectionPage",
      expectedName: "YEON Blog",
    },
    articleStructuredData: {
      expectedType: "BlogPosting",
      expectedName: "NEXA를 Discord 서버 운영자 관점에서 설계하는 이유",
    },
  },
];

const PUBLIC_CONTENT_VIEWPORT_CASES = [
  {
    path: "/support",
    heading: "필요한 해결 방법을 서비스별로 찾으세요",
  },
  {
    path: "/support/nexa/guides/add-nexa-discord-bot",
    heading: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
  },
] as const;

function normalizeUrl(rawUrl: string | null) {
  expect(rawUrl).toBeTruthy();
  return new URL(rawUrl ?? "").toString();
}

async function expectCanonical(page: Page, expectedUrl: string) {
  const canonicalHref = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");

  expect(normalizeUrl(canonicalHref)).toBe(new URL(expectedUrl).toString());
}

async function expectMetaDescription(page: Page, descriptionIncludes: string) {
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");

  expect(description).toContain(descriptionIncludes);
}

async function getStructuredDataItems(page: Page) {
  return page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => JSON.parse(node.textContent ?? "{}"))
    );
}

async function expectStructuredData(
  page: Page,
  { expectedType, expectedName }: StructuredDataExpectation
) {
  const structuredDataItems = await getStructuredDataItems(page);

  expect(structuredDataItems).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "@type": expectedType,
      }),
    ])
  );

  const targetItem = structuredDataItems.find(
    (item) => item["@type"] === expectedType
  );

  expect(targetItem?.name ?? targetItem?.headline).toBe(expectedName);
}

function getHtmlAttribute(tag: string, attributeName: string) {
  const attributeMatch = tag.match(
    new RegExp(`\\b${attributeName}=["']([^"']+)["']`)
  );

  return attributeMatch?.[1] ?? null;
}

function getCanonicalHrefFromHtml(html: string) {
  const linkTags = html.match(/<link\b[^>]*>/g) ?? [];
  const canonicalTag = linkTags.find(
    (tag) => getHtmlAttribute(tag, "rel") === "canonical"
  );

  return canonicalTag ? getHtmlAttribute(canonicalTag, "href") : null;
}

function getMetaDescriptionFromHtml(html: string) {
  const metaTags = html.match(/<meta\b[^>]*>/g) ?? [];
  const descriptionTag = metaTags.find(
    (tag) => getHtmlAttribute(tag, "name") === "description"
  );

  return descriptionTag ? getHtmlAttribute(descriptionTag, "content") : null;
}

function getTitleFromHtml(html: string) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);

  return titleMatch?.[1]?.trim() ?? "";
}

function getStructuredDataItemsFromHtml(html: string) {
  return [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g
    ),
  ].map((match) => JSON.parse(match[1] ?? "{}"));
}

function getSitemapLocations(sitemapXml: string) {
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1]
  );
}

function expectPublicHtmlMetadata({
  html,
  canonical,
  heading,
  structuredData,
}: {
  html: string;
  canonical: string;
  heading: string;
  structuredData: StructuredDataExpectation;
}) {
  expect(html).toContain(heading);
  expect(normalizeUrl(getCanonicalHrefFromHtml(html))).toBe(
    new URL(canonical).toString()
  );
  expect(getTitleFromHtml(html).length).toBeGreaterThan(0);
  expect(getMetaDescriptionFromHtml(html)?.length ?? 0).toBeGreaterThan(0);
  expectStructuredDataItems(
    getStructuredDataItemsFromHtml(html),
    structuredData
  );
  expectPublicHtmlDoesNotExposeAdminControls(html);
}

function expectStructuredDataItems(
  structuredDataItems: unknown[],
  { expectedType, expectedName }: StructuredDataExpectation
) {
  expect(structuredDataItems).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "@type": expectedType,
      }),
    ])
  );

  const targetItem = structuredDataItems.find(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "@type" in item &&
      item["@type"] === expectedType
  );

  expect(
    targetItem && typeof targetItem === "object" && "name" in targetItem
      ? targetItem.name
      : targetItem && typeof targetItem === "object" && "headline" in targetItem
        ? targetItem.headline
        : undefined
  ).toBe(expectedName);
}

function expectPublicHtmlDoesNotExposeAdminControls(html: string) {
  expect(html).not.toMatch(/href=["'][^"']*\/admin\//);
  expect(html).not.toContain("data-public-content-admin-toolbar");
  expect(html).not.toContain("public-content-admin-toolbar");
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.documentElement.clientWidth,
    document:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));

  expect(overflow.body).toBeLessThanOrEqual(1);
  expect(overflow.document).toBeLessThanOrEqual(1);
}

async function expectSingleH1(page: Page, heading: string) {
  await expect(
    page.getByRole("heading", { name: heading, level: 1 })
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
}

async function getWithHost(
  request: APIRequestContext,
  host: string,
  path: string
) {
  return request.get(path, {
    headers: {
      Host: host,
      "x-forwarded-host": host,
    },
  });
}

async function installAnalyticsRecorder(page: Page) {
  await page.addInitScript(() => {
    const analyticsWindow = window as AnalyticsWindow;

    analyticsWindow.__yeonAnalyticsEvents = [];
    analyticsWindow.dataLayer = [];
    analyticsWindow.gtag = (...args: unknown[]) => {
      analyticsWindow.__yeonAnalyticsEvents?.push(args);
      analyticsWindow.dataLayer?.push(args);
    };
  });
}

async function readAnalyticsEvents(page: Page) {
  return page.evaluate(() => {
    const analyticsWindow = window as AnalyticsWindow;

    return analyticsWindow.__yeonAnalyticsEvents ?? [];
  });
}

test.describe("public content SEO smoke", () => {
  for (const pageCase of PUBLIC_CONTENT_PAGE_CASES) {
    test(`${pageCase.path} has public metadata`, async ({ page }) => {
      const response = await page.goto(pageCase.path);

      expect(response?.status()).toBe(200);
      await expect(page).not.toHaveURL(/login=1|auth\/login/);
      await expect(
        page.getByRole("heading", { name: pageCase.heading, level: 1 })
      ).toBeVisible();
      await expectCanonical(page, pageCase.canonical);
      await expectMetaDescription(page, pageCase.descriptionIncludes);
      await expectStructuredData(page, pageCase.structuredData);
    });
  }

  for (const hostCase of PUBLIC_CONTENT_HOST_CASES) {
    test(`${hostCase.host} rewrites to public content`, async ({ request }) => {
      const homeResponse = await getWithHost(request, hostCase.host, "/");
      const homeHtml = await homeResponse.text();

      expect(homeResponse.status()).toBe(200);
      expect(homeResponse.url()).not.toContain("login=1");
      expectPublicHtmlMetadata({
        html: homeHtml,
        canonical: hostCase.homeCanonical,
        heading: hostCase.homeHeading,
        structuredData: hostCase.homeStructuredData,
      });

      const articleResponse = await getWithHost(
        request,
        hostCase.host,
        hostCase.articlePath
      );
      const articleHtml = await articleResponse.text();

      expect(articleResponse.status()).toBe(200);
      expect(articleResponse.url()).not.toContain("login=1");
      expectPublicHtmlMetadata({
        html: articleHtml,
        canonical: hostCase.articleCanonical,
        heading: hostCase.articleHeading,
        structuredData: hostCase.articleStructuredData,
      });
    });

    test(`${hostCase.host} serves host-specific robots and sitemap`, async ({
      request,
    }) => {
      const robotsResponse = await getWithHost(
        request,
        hostCase.host,
        "/robots.txt"
      );
      const robotsText = await robotsResponse.text();

      expect(robotsResponse.status()).toBe(200);
      expect(robotsText).toContain(`Host: https://${hostCase.host}`);
      expect(robotsText).toContain(`Sitemap: ${hostCase.sitemapUrl}`);
      expect(robotsText).toContain("Disallow: /api/");
      expect(robotsText).toContain("Disallow: /auth/");

      const sitemapResponse = await getWithHost(
        request,
        hostCase.host,
        "/sitemap.xml"
      );
      const sitemapXml = await sitemapResponse.text();

      expect(sitemapResponse.status()).toBe(200);
      expect(sitemapXml).toContain(`https://${hostCase.host}`);
      expect(sitemapXml).toContain(
        `https://${hostCase.host}${hostCase.articlePath}`
      );
      expect(sitemapXml).toContain(
        `https://${hostCase.host}${hostCase.collectionPath}`
      );
      expect(sitemapXml).not.toContain("/admin/");
      expect(sitemapXml).not.toContain("/api/");
      expect(sitemapXml).not.toContain("/auth/");
      expect(sitemapXml).not.toContain("draft");
      expect(sitemapXml).not.toContain("https://yeon.world/privacy");

      const sitemapLocations = getSitemapLocations(sitemapXml);
      const normalizedSitemapLocations = sitemapLocations.map((location) =>
        new URL(location).toString()
      );
      expect(sitemapLocations.length).toBeGreaterThan(0);
      expect(normalizedSitemapLocations).toEqual(
        expect.arrayContaining([
          new URL(hostCase.homeCanonical).toString(),
          new URL(hostCase.collectionCanonical).toString(),
          new URL(hostCase.articleCanonical).toString(),
        ])
      );

      for (const sitemapLocation of sitemapLocations) {
        const url = new URL(sitemapLocation);
        expect(url.host).toBe(hostCase.host);

        const sitemapLocationResponse = await getWithHost(
          request,
          hostCase.host,
          url.pathname
        );
        expect(sitemapLocationResponse.status()).toBe(200);
        expect(sitemapLocationResponse.url()).not.toContain("login=1");
      }
    });
  }

  for (const pageCase of PUBLIC_CONTENT_VIEWPORT_CASES) {
    test(`${pageCase.path} keeps heading structure and mobile width stable`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const response = await page.goto(pageCase.path);

      expect(response?.status()).toBe(200);
      await expectSingleH1(page, pageCase.heading);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("article body width stays readable on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    const response = await page.goto(
      "/support/nexa/guides/add-nexa-discord-bot"
    );

    expect(response?.status()).toBe(200);

    const articleWidth = await page
      .locator("article")
      .evaluate((element) => element.getBoundingClientRect().width);

    expect(articleWidth).toBeLessThanOrEqual(960);
  });

  test("public content CTA click sends GA4 event params", async ({ page }) => {
    await installAnalyticsRecorder(page);
    await page.goto("/support/nexa/guides/add-nexa-discord-bot");

    const ctaLink = page.getByRole("link", {
      name: "NEXA 설치 페이지 열기",
    });

    await ctaLink.evaluate((element) => {
      element.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
        },
        { once: true }
      );
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    });

    await expect
      .poll(async () => readAnalyticsEvents(page))
      .toContainEqual([
        "event",
        "public_content_cta_click",
        expect.objectContaining({
          category: "guides",
          channel: "support",
          link_kind: "article_cta",
          service: "nexa",
          slug: "nexa/guides/add-nexa-discord-bot",
          target_title: "NEXA 설치 페이지 열기",
          target_url: "https://discord-ai.yeon.world/install",
        }),
      ]);
  });
});
