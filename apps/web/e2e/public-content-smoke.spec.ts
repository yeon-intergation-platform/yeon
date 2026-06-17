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
  homeHeading: string;
  collectionPath: string;
  articlePath: string;
  articleHeading: string;
  sitemapUrl: string;
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
    homeHeading: "필요한 해결 방법을 서비스별로 찾으세요",
    collectionPath: "/nexa/guides",
    articlePath: "/nexa/guides/add-nexa-discord-bot",
    articleHeading: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    sitemapUrl: "https://support.yeon.world/sitemap.xml",
  },
  {
    host: "news.yeon.world",
    homeHeading: "YEON의 공식 소식과 제품 변경사항",
    collectionPath: "/updates/nexa",
    articlePath: "/notice/support-open",
    articleHeading: "YEON support.yeon.world 오픈 안내",
    sitemapUrl: "https://news.yeon.world/sitemap.xml",
  },
  {
    host: "blog.yeon.world",
    homeHeading: "제품을 만들며 남기는 기술과 결정의 기록",
    collectionPath: "/engineering",
    articlePath: "/product/nexa-discord-server-operator-design",
    articleHeading: "NEXA를 Discord 서버 운영자 관점에서 설계하는 이유",
    sitemapUrl: "https://blog.yeon.world/sitemap.xml",
  },
];

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
      expect(homeHtml).toContain(hostCase.homeHeading);

      const articleResponse = await getWithHost(
        request,
        hostCase.host,
        hostCase.articlePath
      );
      const articleHtml = await articleResponse.text();

      expect(articleResponse.status()).toBe(200);
      expect(articleResponse.url()).not.toContain("login=1");
      expect(articleHtml).toContain(hostCase.articleHeading);
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
      expect(sitemapXml).not.toContain("https://yeon.world/privacy");
    });
  }

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
