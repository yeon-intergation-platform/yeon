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
  articlePath: string;
  articleHeading: string;
  sitemapUrl: string;
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
    articlePath: "/nexa/guides/add-nexa-discord-bot",
    articleHeading: "디스코드 서버에 NEXA AI 봇 추가하는 방법",
    sitemapUrl: "https://support.yeon.world/sitemap.xml",
  },
  {
    host: "news.yeon.world",
    homeHeading: "YEON의 공식 소식과 제품 변경사항",
    articlePath: "/notice/support-open",
    articleHeading: "YEON support.yeon.world 오픈 안내",
    sitemapUrl: "https://news.yeon.world/sitemap.xml",
  },
  {
    host: "blog.yeon.world",
    homeHeading: "제품을 만들며 남기는 기술과 결정의 기록",
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
      expect(sitemapXml).not.toContain("https://yeon.world/privacy");
    });
  }
});
