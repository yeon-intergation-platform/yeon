import { YeonStructuredData } from "@yeon/ui";
import { showYeonNotFound } from "@yeon/ui/runtime/YeonRouteControl";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { Suspense, type ReactNode } from "react";
import {
  buildPublicContentArticleBreadcrumb,
  buildPublicContentCollectionBreadcrumb,
} from "./public-content-breadcrumb";
import { PublicContentBreadcrumb } from "./public-content-breadcrumb-view";
import { PublicContentArticleCard } from "./public-content-article-card";
import { getPublicContentBlogDetailModel } from "./public-content-blog-detail";
import { PublicContentBlogArticleContextPanel } from "./public-content-blog-detail-view";
import { getPublicContentBlogHomeModel } from "./public-content-blog-home";
import { PublicContentBlogHomePriority } from "./public-content-blog-home-view";
import { PublicContentBlockView } from "./public-content-block-view";
import { getPublicContentRelatedArticles } from "./public-content-related-articles";
import { PublicContentRelatedArticles } from "./public-content-related-articles-view";
import {
  PUBLIC_CONTENT_CHANNEL_CONFIG,
  PUBLIC_CONTENT_CHANNELS,
  buildPublicContentCanonicalUrl,
  getPublicContentArticleBySlug,
  getPublicContentArticles,
  getPublicContentCategoryLabel,
  getPublicContentChannelConfig,
  getPublicContentCollectionBySlug,
  getPublicContentCollections,
  getPublicContentServiceLabel,
  getPublicContentServicesForChannel,
  type PublicContentArticle,
  type PublicContentChannel,
  type PublicContentCollection,
} from "./public-content-data";
import { getPublicContentReviewDate } from "./public-content-freshness";
import {
  getPublicContentCategoryNavItems,
  getPublicContentNewsTopicNavItems,
  getPublicContentServiceNavItems,
  isPublicContentService,
  type PublicContentNavigationItem,
} from "./public-content-navigation";
import {
  PublicContentCategoryNav,
  PublicContentServiceNav,
  PublicContentTopicNav,
} from "./public-content-navigation-view";
import { getPublicContentNewsHomeModel } from "./public-content-news-home";
import {
  PublicContentNewsArticleContextPanel,
  PublicContentNewsHomePriority,
} from "./public-content-news-home-view";
import { PublicContentNewsDetailSections } from "./public-content-news-detail-view";
import { PublicContentOpsToolbarClient } from "./public-content-ops-toolbar-client";
import { buildPublicContentArticleStructuredData } from "./public-content-structured-data";
import {
  getPublicContentSupportHomeProblemEntries,
  getPublicContentSupportHomeServiceEntries,
} from "./public-content-support-home";
import { getPublicContentSupportPrimaryActionItems } from "./public-content-support-action-summary";
import { PublicContentSupportActionSummary } from "./public-content-support-action-summary-view";
import {
  PublicContentSupportHomeProblemEntries,
  PublicContentSupportHomeServiceEntries,
} from "./public-content-support-home-view";
import {
  buildPublicContentTableOfContents,
  shouldShowPublicContentTableOfContents,
  type PublicContentTableOfContentsItem,
} from "./public-content-table-of-contents";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

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

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

function getArticleContainerClassName(article: PublicContentArticle) {
  if (article.channel === PUBLIC_CONTENT_CHANNELS.blog) {
    return "mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16";
  }

  return "mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16";
}

function getArticleBodyClassName(article: PublicContentArticle) {
  if (article.channel === PUBLIC_CONTENT_CHANNELS.support) {
    return "min-w-0 max-w-[760px] space-y-7";
  }

  if (article.channel === PUBLIC_CONTENT_CHANNELS.blog) {
    return "min-w-0 max-w-[820px] space-y-8";
  }

  return "min-w-0 space-y-7";
}

function compareArticlesByDate(
  left: PublicContentArticle,
  right: PublicContentArticle
) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function PublicContentNavigationGroup({
  categoryItems,
  channel,
  serviceItems,
  topicItems = [],
}: {
  categoryItems: readonly PublicContentNavigationItem[];
  channel: PublicContentChannel;
  serviceItems: readonly PublicContentNavigationItem[];
  topicItems?: readonly PublicContentNavigationItem[];
}) {
  if (
    categoryItems.length === 0 &&
    serviceItems.length === 0 &&
    topicItems.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <PublicContentServiceNav channel={channel} items={serviceItems} />
      <PublicContentTopicNav channel={channel} items={topicItems} />
      <PublicContentCategoryNav channel={channel} items={categoryItems} />
    </div>
  );
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

function getJsonLdForCollection(collection: PublicContentCollection) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    url: collection.canonicalUrl,
    inLanguage: "ko-KR",
    description: collection.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.articles.map((article, index) => ({
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
          <PublicContentTrackedLink
            href="https://yeon.world"
            className="w-fit text-[16px] font-semibold text-[#111] no-underline"
            trackingParams={{
              channel,
              link_kind: "channel_nav",
              target_title: "YEON",
            }}
          >
            YEON
          </PublicContentTrackedLink>
          <nav className="flex flex-wrap gap-2" aria-label="공개 콘텐츠 채널">
            {CHANNEL_NAV_ITEMS.map((item) => {
              const isActive = item.label === activeConfig.label;

              return (
                <PublicContentTrackedLink
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg border px-3 py-2 text-[13px] font-semibold no-underline transition-colors ${
                    isActive
                      ? "border-[#111] bg-[#111] text-white"
                      : "border-[#e5e5e5] text-[#666] hover:border-[#111] hover:text-[#111]"
                  }`}
                  trackingParams={{
                    channel,
                    link_kind: "channel_nav",
                    target_title: item.label,
                  }}
                >
                  {item.label}
                </PublicContentTrackedLink>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </main>
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
            {getPublicContentServiceLabel(service)}
          </p>
          <h2 className="mt-1 text-[24px] font-semibold text-[#111]">
            {getPublicContentServiceLabel(service)} 문서
          </h2>
        </div>
        <p className="text-[13px] text-[#666]">{articles.length}개 글</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <PublicContentArticleCard
            key={article.slugSegments.join("/")}
            article={article}
          />
        ))}
      </div>
    </section>
  );
}

function PublicContentTableOfContents({
  items,
  variant,
}: {
  items: readonly PublicContentTableOfContentsItem[];
  variant: "desktop" | "mobile";
}) {
  if (items.length === 0) return null;

  const links = (
    <ol className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-md px-2 py-1 text-[13px] leading-5 text-[#666] no-underline transition-colors hover:bg-[#fafafa] hover:text-[#111]"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "mobile") {
    return (
      <details className="rounded-lg border border-[#e5e5e5] bg-white p-4 lg:hidden">
        <summary className="cursor-pointer text-[13px] font-semibold text-[#111]">
          본문 목차
        </summary>
        <nav className="mt-3" aria-label="본문 목차">
          {links}
        </nav>
      </details>
    );
  }

  return (
    <aside className="hidden lg:block">
      <nav
        className="sticky top-8 border-l border-[#e5e5e5] pl-4"
        aria-label="본문 목차"
      >
        <p className="mb-3 text-[12px] font-semibold text-[#aaa]">본문 목차</p>
        {links}
      </nav>
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
      types: {
        "application/rss+xml": `${config.host}/feed.xml`,
      },
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

  if (article) {
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

  const collection = getPublicContentCollectionBySlug(channel, slug);
  if (collection) {
    return {
      title: `${collection.title} | ${config.title}`,
      description: collection.description,
      alternates: {
        canonical: collection.canonicalUrl,
      },
      openGraph: {
        title: collection.title,
        description: collection.description,
        siteName: config.title,
        type: "website",
        url: collection.canonicalUrl,
        locale: "ko_KR",
      },
      twitter: {
        card: "summary",
        title: collection.title,
        description: collection.description,
      },
    };
  }

  return {
    title: `문서를 찾지 못했습니다 | ${config.title}`,
    robots: { index: false, follow: false },
  };
}

export function getPublicContentStaticParams(channel: PublicContentChannel) {
  return [
    ...getPublicContentCollections(channel).map((collection) => ({
      slug: [...collection.slugSegments],
    })),
    ...getPublicContentArticles(channel).map((article) => ({
      slug: [...article.slugSegments],
    })),
  ];
}

export function PublicContentHome({ channel }: PublicContentHomeProps) {
  const config = getPublicContentChannelConfig(channel);
  const articles = getPublicContentArticles(channel).sort(
    compareArticlesByDate
  );
  const services = getPublicContentServicesForChannel(channel);
  const newsHomeModel =
    channel === PUBLIC_CONTENT_CHANNELS.news
      ? getPublicContentNewsHomeModel()
      : null;
  const blogHomeModel =
    channel === PUBLIC_CONTENT_CHANNELS.blog
      ? getPublicContentBlogHomeModel()
      : null;
  const featuredArticle =
    channel === PUBLIC_CONTENT_CHANNELS.news ||
    channel === PUBLIC_CONTENT_CHANNELS.blog
      ? null
      : (articles[0] ?? null);
  const serviceNavItems = getPublicContentServiceNavItems({ channel });
  const categoryNavItems = getPublicContentCategoryNavItems({ channel });
  const supportProblemEntries =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? getPublicContentSupportHomeProblemEntries()
      : [];
  const supportServiceEntries =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? getPublicContentSupportHomeServiceEntries()
      : [];

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
          {featuredArticle ? (
            <PublicContentArticleCard article={featuredArticle} />
          ) : null}
        </div>
      </section>
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportHomeProblemEntries
          entries={supportProblemEntries}
        />
      ) : null}
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportHomeServiceEntries
          entries={supportServiceEntries}
        />
      ) : (
        <section className="mx-auto max-w-6xl px-6 pb-8 md:px-8">
          <PublicContentNavigationGroup
            categoryItems={categoryNavItems}
            channel={channel}
            serviceItems={serviceNavItems}
          />
        </section>
      )}
      {newsHomeModel ? (
        <PublicContentNewsHomePriority model={newsHomeModel} />
      ) : null}
      {blogHomeModel ? (
        <PublicContentBlogHomePriority model={blogHomeModel} />
      ) : null}
      {channel !== PUBLIC_CONTENT_CHANNELS.news &&
      channel !== PUBLIC_CONTENT_CHANNELS.blog ? (
        <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
          {services.map((service) => (
            <ServiceSection key={service} channel={channel} service={service} />
          ))}
        </section>
      ) : null}
    </PublicContentShell>
  );
}

function getCollectionActiveService(collection: PublicContentCollection) {
  const [firstSegment, secondSegment] = collection.slugSegments;
  const serviceSegment =
    collection.channel === PUBLIC_CONTENT_CHANNELS.support
      ? firstSegment
      : secondSegment;

  return isPublicContentService(serviceSegment) ? serviceSegment : undefined;
}

function getCollectionActiveCategory(collection: PublicContentCollection) {
  return collection.channel === PUBLIC_CONTENT_CHANNELS.support
    ? collection.slugSegments[1]
    : collection.slugSegments[0];
}

function getCollectionActiveNewsTopic(collection: PublicContentCollection) {
  if (
    collection.channel !== PUBLIC_CONTENT_CHANNELS.news ||
    collection.slugSegments[0] !== "news"
  ) {
    return undefined;
  }

  return collection.slugSegments[1];
}

function PublicContentCollectionPage({
  collection,
}: {
  collection: PublicContentCollection;
}) {
  const breadcrumbItems = buildPublicContentCollectionBreadcrumb(collection);
  const activeService = getCollectionActiveService(collection);
  const activeCategory = getCollectionActiveCategory(collection);
  const activeNewsTopic = getCollectionActiveNewsTopic(collection);
  const categoryNavItems = getPublicContentCategoryNavItems({
    activeCategory,
    channel: collection.channel,
    service:
      collection.channel === PUBLIC_CONTENT_CHANNELS.support
        ? activeService
        : undefined,
  });
  const serviceNavItems = getPublicContentServiceNavItems({
    activeService,
    channel: collection.channel,
    parentCategory:
      collection.channel === PUBLIC_CONTENT_CHANNELS.support
        ? undefined
        : activeCategory,
  });
  const topicNavItems =
    collection.channel === PUBLIC_CONTENT_CHANNELS.news &&
    activeCategory === "news"
      ? getPublicContentNewsTopicNavItems({ activeTopic: activeNewsTopic })
      : [];

  return (
    <PublicContentShell channel={collection.channel}>
      <YeonStructuredData
        id={`${collection.channel}-${collection.slugSegments.join("-")}-collection-jsonld`}
        data={getJsonLdForCollection(collection)}
      />
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        <PublicContentBreadcrumb
          channel={collection.channel}
          items={breadcrumbItems}
          sourceTitle={collection.title}
        />
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="max-w-3xl text-[36px] font-semibold leading-tight text-[#111] md:text-[48px]">
              {collection.title}
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#666]">
              {collection.description}
            </p>
          </div>
          <p className="text-[13px] font-semibold text-[#aaa]">
            {collection.articles.length}개 글
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-8 md:px-8">
        <PublicContentNavigationGroup
          categoryItems={categoryNavItems}
          channel={collection.channel}
          serviceItems={serviceNavItems}
          topicItems={topicNavItems}
        />
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-2 md:px-8">
        {collection.articles.map((article) => (
          <PublicContentArticleCard
            key={article.slugSegments.join("/")}
            article={article}
          />
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
    const collection = getPublicContentCollectionBySlug(channel, slugSegments);
    if (collection) {
      return <PublicContentCollectionPage collection={collection} />;
    }

    showYeonNotFound();
  }

  const relatedArticles = getPublicContentRelatedArticles(article);
  const ctaHref = buildCtaHref(article);
  const blogDetailModel = getPublicContentBlogDetailModel(article);
  const tableOfContents = shouldShowPublicContentTableOfContents(article)
    ? buildPublicContentTableOfContents(article)
    : [];
  const hasTableOfContents = tableOfContents.length > 0;
  const headingIdByBlockIndex = new Map(
    tableOfContents.map((item) => [item.blockIndex, item.id])
  );
  const breadcrumbItems = buildPublicContentArticleBreadcrumb(article);
  const supportPrimaryActionItems =
    getPublicContentSupportPrimaryActionItems(article);

  return (
    <PublicContentShell channel={article.channel}>
      <YeonStructuredData
        id={`${article.channel}-${article.slugSegments.join("-")}-jsonld`}
        data={buildPublicContentArticleStructuredData(article)}
      />
      <article className={getArticleContainerClassName(article)}>
        <PublicContentBreadcrumb
          category={article.category}
          channel={article.channel}
          items={breadcrumbItems}
          service={article.service}
          sourceTitle={article.title}
        />
        <div className="mt-6 flex flex-wrap gap-2 text-[13px] font-semibold text-[#aaa]">
          <span>{getPublicContentServiceLabel(article.service)}</span>
          <span aria-hidden="true">/</span>
          <span>{getPublicContentCategoryLabel(article.category)}</span>
          <span aria-hidden="true">/</span>
          <span>{article.publishedAt}</span>
          {article.channel === "support" ? (
            <>
              <span aria-hidden="true">/</span>
              <span>최근 확인 {getPublicContentReviewDate(article)}</span>
            </>
          ) : null}
        </div>
        <h1 className="mt-4 text-[36px] font-semibold leading-tight text-[#111] md:text-[48px]">
          {article.title}
        </h1>
        <p className="mt-5 max-w-[760px] text-[17px] leading-8 text-[#666]">
          {article.description}
        </p>
        <PublicContentBlogArticleContextPanel
          article={article}
          model={blogDetailModel}
        />
        <Suspense fallback={null}>
          <PublicContentOpsToolbarClient
            article={{
              category: article.category,
              channel: article.channel,
              service: article.service,
              slugSegments: article.slugSegments,
            }}
          />
        </Suspense>
        <PublicContentNewsArticleContextPanel article={article} />
        <PublicContentNewsDetailSections article={article} />
        <PublicContentSupportActionSummary items={supportPrimaryActionItems} />
        <div className="mt-8 border-t border-[#e5e5e5] pt-8">
          {hasTableOfContents ? (
            <PublicContentTableOfContents
              items={tableOfContents}
              variant="mobile"
            />
          ) : null}
          <div
            className={
              hasTableOfContents
                ? "mt-8 grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]"
                : undefined
            }
          >
            {hasTableOfContents ? (
              <PublicContentTableOfContents
                items={tableOfContents}
                variant="desktop"
              />
            ) : null}
            <div className={getArticleBodyClassName(article)}>
              {article.body.map((block, index) => (
                <PublicContentBlockView
                  key={index}
                  block={block}
                  headingId={headingIdByBlockIndex.get(index)}
                />
              ))}
            </div>
          </div>
        </div>
        {ctaHref ? (
          <div className="mt-10 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-5">
            <p className="text-[14px] font-semibold text-[#111]">
              다음 단계로 이동
            </p>
            <PublicContentTrackedLink
              href={ctaHref}
              className="mt-4 inline-flex rounded-lg bg-[#111] px-4 py-2 text-[14px] font-semibold text-white no-underline"
              eventType="cta"
              trackingParams={{
                category: article.category,
                channel: article.channel,
                link_kind: "article_cta",
                service: article.service,
                slug: getArticleSlug(article),
                source_title: article.title,
                target_title: article.ctaLabel,
              }}
            >
              {article.ctaLabel}
            </PublicContentTrackedLink>
          </div>
        ) : null}
        <PublicContentRelatedArticles articles={relatedArticles} />
      </article>
    </PublicContentShell>
  );
}
