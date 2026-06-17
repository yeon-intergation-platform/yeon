import { YeonStructuredData } from "@yeon/ui";
import { showYeonNotFound } from "@yeon/ui/runtime/YeonRouteControl";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import type { ReactNode } from "react";
import {
  PUBLIC_CONTENT_CATEGORY_LABELS,
  PUBLIC_CONTENT_CHANNEL_CONFIG,
  PUBLIC_CONTENT_SERVICE_LABELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticleBySlug,
  getPublicContentArticles,
  getPublicContentChannelConfig,
  getPublicContentServicesForChannel,
  type PublicContentArticle,
  type PublicContentBlock,
  type PublicContentChannel,
} from "./public-content-data";

type PublicContentHomeProps = {
  channel: PublicContentChannel;
};

type PublicContentArticleProps = {
  channel: PublicContentChannel;
  slugSegments: readonly string[];
};

type PublicContentRouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

const CHANNEL_NAV_ITEMS = Object.values(PUBLIC_CONTENT_CHANNEL_CONFIG).map(
  (config) => ({
    label: config.label,
    href: config.host,
  })
);

function getCategoryLabel(category: string) {
  return (
    PUBLIC_CONTENT_CATEGORY_LABELS[
      category as keyof typeof PUBLIC_CONTENT_CATEGORY_LABELS
    ] ?? category
  );
}

function buildCtaHref(article: PublicContentArticle) {
  if (!article.ctaHref) return null;

  if (article.ctaHref.startsWith("/")) {
    return buildPublicContentCanonicalUrl(
      article.channel,
      article.ctaHref.split("/").filter(Boolean)
    );
  }

  return article.ctaHref;
}

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function getJsonLdForHome(channel: PublicContentChannel) {
  const config = getPublicContentChannelConfig(channel);
  const articles = getPublicContentArticles(channel);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.title,
    url: config.host,
    inLanguage: "ko-KR",
    description: config.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: buildPublicContentCanonicalUrl(
          article.channel,
          article.slugSegments
        ),
      })),
    },
  };
}

function getJsonLdForArticle(article: PublicContentArticle) {
  const articleType =
    article.channel === "news"
      ? "NewsArticle"
      : article.channel === "blog"
        ? "BlogPosting"
        : "Article";

  return {
    "@context": "https://schema.org",
    "@type": articleType,
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: "ko-KR",
    mainEntityOfPage: buildPublicContentCanonicalUrl(
      article.channel,
      article.slugSegments
    ),
    author: {
      "@type": "Organization",
      name: "YEON",
    },
    publisher: {
      "@type": "Organization",
      name: "YEON",
      url: "https://yeon.world",
    },
  };
}

function PublicContentShell({
  channel,
  children,
}: {
  channel: PublicContentChannel;
  children: ReactNode;
}) {
  const activeConfig = getPublicContentChannelConfig(channel);

  return (
    <main className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <a
            href="https://yeon.world"
            className="w-fit text-[16px] font-semibold text-[#111] no-underline"
          >
            YEON
          </a>
          <nav className="flex flex-wrap gap-2" aria-label="공개 콘텐츠 채널">
            {CHANNEL_NAV_ITEMS.map((item) => {
              const isActive = item.label === activeConfig.label;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg border px-3 py-2 text-[13px] font-semibold no-underline transition-colors ${
                    isActive
                      ? "border-[#111] bg-[#111] text-white"
                      : "border-[#e5e5e5] text-[#666] hover:border-[#111] hover:text-[#111]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}

function ArticleCard({ article }: { article: PublicContentArticle }) {
  const href = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );

  return (
    <a
      href={href}
      className="group block rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5 text-[#111] no-underline transition-colors hover:border-[#111] hover:bg-white"
    >
      <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#aaa]">
        <span>{PUBLIC_CONTENT_SERVICE_LABELS[article.service]}</span>
        <span aria-hidden="true">/</span>
        <span>{getCategoryLabel(article.category)}</span>
      </div>
      <h2 className="mt-4 text-[20px] font-semibold leading-7 text-[#111]">
        {article.title}
      </h2>
      <p className="mt-3 text-[14px] leading-6 text-[#666]">
        {article.summary}
      </p>
      <div className="mt-5 flex items-center justify-between gap-4 text-[13px] text-[#aaa]">
        <span>{article.publishedAt}</span>
        <span>{article.readingMinutes}분</span>
      </div>
    </a>
  );
}

function ServiceSection({
  channel,
  service,
}: {
  channel: PublicContentChannel;
  service: PublicContentArticle["service"];
}) {
  const articles = getPublicContentArticles(channel)
    .filter((article) => article.service === service)
    .sort(compareArticlesByDate);

  return (
    <section className="border-t border-[#e5e5e5] py-10">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#aaa]">
            {PUBLIC_CONTENT_SERVICE_LABELS[service]}
          </p>
          <h2 className="mt-1 text-[24px] font-semibold text-[#111]">
            {PUBLIC_CONTENT_SERVICE_LABELS[service]} 문서
          </h2>
        </div>
        <p className="text-[13px] text-[#666]">{articles.length}개 글</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.slugSegments.join("/")} article={article} />
        ))}
      </div>
    </section>
  );
}

function renderBlock(block: PublicContentBlock, index: number) {
  if (block.type === "paragraph") {
    return (
      <p key={index} className="text-[16px] leading-8 text-[#111]">
        {block.text}
      </p>
    );
  }

  if (block.type === "heading") {
    return (
      <h2 key={index} className="pt-4 text-[24px] font-semibold text-[#111]">
        {block.title}
      </h2>
    );
  }

  if (block.type === "steps") {
    return (
      <ol key={index} className="space-y-3">
        {block.items.map((item, itemIndex) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-7 text-[#111]"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fafafa] text-[13px] font-semibold text-[#111]">
              {itemIndex + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === "checklist") {
    return (
      <ul key={index} className="space-y-3">
        {block.items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-7 text-[#111]"
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-lg bg-[#111]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <aside
      key={index}
      className="rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5"
    >
      <p className="text-[14px] font-semibold text-[#111]">{block.title}</p>
      <p className="mt-2 text-[14px] leading-6 text-[#666]">{block.text}</p>
    </aside>
  );
}

export function getPublicContentHomeMetadata(
  channel: PublicContentChannel
): YeonPageMetadata {
  const config = getPublicContentChannelConfig(channel);

  return {
    title: `${config.title} | YEON`,
    description: config.description,
    alternates: {
      canonical: config.host,
    },
    openGraph: {
      title: `${config.title} | YEON`,
      description: config.description,
      siteName: "YEON",
      type: "website",
      url: config.host,
      locale: "ko_KR",
    },
    twitter: {
      card: "summary",
      title: `${config.title} | YEON`,
      description: config.description,
    },
  };
}

export async function getPublicContentArticleMetadata({
  channel,
  params,
}: {
  channel: PublicContentChannel;
  params: PublicContentRouteProps["params"];
}): Promise<YeonPageMetadata> {
  const { slug = [] } = await params;
  const article = getPublicContentArticleBySlug(channel, slug);
  const config = getPublicContentChannelConfig(channel);

  if (!article) {
    return {
      title: `문서를 찾지 못했습니다 | ${config.title}`,
      robots: { index: false, follow: false },
    };
  }

  const canonical = buildPublicContentCanonicalUrl(
    article.channel,
    article.slugSegments
  );

  return {
    title: `${article.title} | ${config.title}`,
    description: article.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      siteName: config.title,
      type: "article",
      url: canonical,
      locale: "ko_KR",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.description,
    },
  };
}

export function getPublicContentStaticParams(channel: PublicContentChannel) {
  return getPublicContentArticles(channel).map((article) => ({
    slug: [...article.slugSegments],
  }));
}

export function PublicContentHome({ channel }: PublicContentHomeProps) {
  const config = getPublicContentChannelConfig(channel);
  const articles = getPublicContentArticles(channel).sort(
    compareArticlesByDate
  );
  const services = getPublicContentServicesForChannel(channel);
  const featuredArticle = articles[0] ?? null;

  return (
    <PublicContentShell channel={channel}>
      <YeonStructuredData
        id={`${channel}-home-jsonld`}
        data={getJsonLdForHome(channel)}
      />
      <section className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16">
        <p className="text-[13px] font-semibold text-[#aaa]">
          {config.homeEyebrow}
        </p>
        <div className="mt-4 grid gap-8 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <h1 className="max-w-3xl text-[40px] font-semibold leading-tight text-[#111] md:text-[48px]">
              {config.homeTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#666]">
              {config.homeDescription}
            </p>
          </div>
          {featuredArticle ? <ArticleCard article={featuredArticle} /> : null}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
        {services.map((service) => (
          <ServiceSection key={service} channel={channel} service={service} />
        ))}
      </section>
    </PublicContentShell>
  );
}

export async function PublicContentArticlePage({
  channel,
  slugSegments,
}: PublicContentArticleProps) {
  const article = getPublicContentArticleBySlug(channel, slugSegments);

  if (!article) {
    showYeonNotFound();
  }

  const config = getPublicContentChannelConfig(article.channel);
  const relatedArticles = getPublicContentArticles(article.channel)
    .filter(
      (candidate) =>
        candidate.slugSegments.join("/") !== article.slugSegments.join("/") &&
        candidate.service === article.service
    )
    .slice(0, 2);
  const ctaHref = buildCtaHref(article);

  return (
    <PublicContentShell channel={article.channel}>
      <YeonStructuredData
        id={`${article.channel}-${article.slugSegments.join("-")}-jsonld`}
        data={getJsonLdForArticle(article)}
      />
      <article className="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">
        <a
          href={config.host}
          className="text-[13px] font-semibold text-[#666] no-underline hover:text-[#111]"
        >
          {config.label}
        </a>
        <div className="mt-6 flex flex-wrap gap-2 text-[13px] font-semibold text-[#aaa]">
          <span>{PUBLIC_CONTENT_SERVICE_LABELS[article.service]}</span>
          <span aria-hidden="true">/</span>
          <span>{getCategoryLabel(article.category)}</span>
          <span aria-hidden="true">/</span>
          <span>{article.publishedAt}</span>
        </div>
        <h1 className="mt-4 text-[36px] font-semibold leading-tight text-[#111] md:text-[48px]">
          {article.title}
        </h1>
        <p className="mt-5 max-w-3xl text-[17px] leading-8 text-[#666]">
          {article.description}
        </p>
        <div className="mt-8 border-t border-[#e5e5e5] pt-8">
          <div className="space-y-7">
            {article.body.map((block, index) => renderBlock(block, index))}
          </div>
        </div>
        {ctaHref ? (
          <div className="mt-10 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5">
            <p className="text-[14px] font-semibold text-[#111]">
              다음 단계로 이동
            </p>
            <a
              href={ctaHref}
              className="mt-4 inline-flex rounded-lg bg-[#111] px-4 py-2 text-[14px] font-semibold text-white no-underline"
            >
              {article.ctaLabel}
            </a>
          </div>
        ) : null}
        {relatedArticles.length > 0 ? (
          <section className="mt-12 border-t border-[#e5e5e5] pt-8">
            <h2 className="text-[20px] font-semibold text-[#111]">관련 글</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.slugSegments.join("/")}
                  article={relatedArticle}
                />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </PublicContentShell>
  );
}
