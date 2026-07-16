import { YeonStructuredData } from "@yeon/ui";
import { showYeonNotFound } from "@yeon/ui/runtime/YeonRouteControl";
import type { YeonPageMetadata } from "@yeon/ui/runtime/YeonPageMetadata";
import { Suspense, type ReactNode } from "react";
import { CommonProductHeader } from "@/components/product-shell/product-header";
import {
  buildPublicContentArticleBreadcrumb,
  buildPublicContentCollectionBreadcrumb,
} from "./public-content-breadcrumb";
import { PublicContentBreadcrumb } from "./public-content-breadcrumb-view";
import { PublicContentArticleCard } from "./public-content-article-card";
import { getPublicContentBlogHomeModel } from "./public-content-blog-home";
import { PublicContentBlogHomePriority } from "./public-content-blog-home-view";
import { PublicContentBlockView } from "./public-content-block-view";
import { getPublicContentRelatedArticles } from "./public-content-related-articles";
import { PublicContentRelatedArticles } from "./public-content-related-articles-view";
import {
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_SERVICES,
  buildPublicContentCanonicalUrl,
  buildPublicContentInternalHref,
  buildPublicContentOpenGraphImageUrl,
  getPublicContentArticleBySlug,
  getPublicContentArticles,
  getPublicContentCategoryLabel,
  getPublicContentChannelConfig,
  getPublicContentCollectionBySlug,
  getPublicContentCollections,
  getPublicContentServiceLabel,
  resolvePublicContentNavigationHref,
  type PublicContentArticle,
  type PublicContentChannel,
  type PublicContentCollection,
} from "./public-content-data";
import { getPublicContentReviewDate } from "./public-content-freshness";
import {
  getPublicContentCategoryNavItems,
  getPublicContentChannelNavigationItems,
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
import { PublicContentNewsHomePriority } from "./public-content-news-home-view";
import { PublicContentOpsToolbarClient } from "./public-content-ops-toolbar-client";
import { buildPublicContentArticleStructuredData } from "./public-content-structured-data";
import {
  getPublicContentSupportHomeNoticeEntry,
  getPublicContentSupportHomeProblemEntries,
  getPublicContentSupportHomeReportEntry,
  getPublicContentSupportHomeServiceEntries,
} from "./public-content-support-home";
import {
  PublicContentSupportHomeProblemEntries,
  PublicContentSupportHomeReportCta,
  PublicContentSupportHomeServiceEntries,
  PublicContentSupportHomeHero,
} from "./public-content-support-home-view";
import { PublicContentSupportSearch } from "./public-content-support-search-view";
import { PublicContentServiceIcon } from "./public-content-service-icon";
import {
  normalizePublicContentSearchQuery,
  searchPublicContentSupportArticles,
} from "./public-content-search";
import {
  buildPublicContentTableOfContents,
  shouldShowPublicContentTableOfContents,
  type PublicContentTableOfContentsItem,
} from "./public-content-table-of-contents";
import { PublicContentTrackedLink } from "./public-content-tracked-link";

type PublicContentHomeProps = {
  channel: PublicContentChannel;
  supportSearchQuery?: string;
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

function buildCtaHref(article: PublicContentArticle) {
  if (!article.ctaHref) return null;

  if (article.ctaHref.startsWith("/")) {
    return buildPublicContentInternalHref(
      article.channel,
      article.ctaHref.split("/").filter(Boolean)
    );
  }

  return resolvePublicContentNavigationHref(article.ctaHref);
}

function getArticleSlug(article: PublicContentArticle) {
  return article.slugSegments.join("/");
}

function getPublicContentArticleHeaderMetaItems(article: PublicContentArticle) {
  const publishedAt = article.publishedAt.replaceAll("-", ".");
  const serviceLabel = getPublicContentServiceLabel(article.service);
  const categoryLabel = getPublicContentCategoryLabel(article.category);

  if (
    article.channel === PUBLIC_CONTENT_CHANNELS.news &&
    article.category === "notice"
  ) {
    return [
      categoryLabel,
      `적용 서비스 ${serviceLabel}`,
      `적용일 ${publishedAt}`,
    ];
  }

  const items = [serviceLabel, categoryLabel, publishedAt];

  if (article.channel === PUBLIC_CONTENT_CHANNELS.support) {
    items.push(`최근 확인 ${getPublicContentReviewDate(article)}`);
  }

  return items;
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
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <CommonProductHeader
        activeService={channel}
        titleNavigation={<PublicContentChannelNavigation channel={channel} />}
      />
      {children}
    </main>
  );
}

function PublicContentChannelNavigation({
  channel,
}: {
  channel: PublicContentChannel;
}) {
  const items = getPublicContentChannelNavigationItems();

  return (
    <div aria-label="공개 콘텐츠 채널" className="min-w-0" role="group">
      <div className="flex min-w-0 gap-1 overflow-x-auto pb-px">
        {items.map((item) => {
          const isActive = item.channel === channel;

          if (isActive) {
            return (
              <span
                key={item.channel}
                aria-current="page"
                className="inline-flex h-8 shrink-0 items-center border border-[#111] bg-[#111] px-2.5 text-[12px] font-semibold text-white"
              >
                {item.label}
              </span>
            );
          }

          return (
            <PublicContentTrackedLink
              key={item.channel}
              href={item.href}
              className="inline-flex h-8 shrink-0 items-center border border-[#e5e5e5] bg-white px-2.5 text-[12px] font-semibold text-[#666] no-underline transition-colors hover:border-[#111] hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
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
      </div>
    </div>
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
  const visibleArticles = articles.slice(0, 4);
  const serviceLabel = getPublicContentServiceLabel(service);
  const serviceHref = buildPublicContentInternalHref(channel, [service]);

  return (
    <section
      id={`support-${service}-documents`}
      className="border-t border-[#e5e5e5] py-10"
    >
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <PublicContentServiceIcon service={service} size={23} />
            <h2 className="text-[24px] font-semibold text-[#111]">
              {serviceLabel} 도움말
            </h2>
          </div>
          <p className="mt-2 text-[14px] leading-6 text-[#666]">
            자주 필요한 문서부터 확인하고, 더 많은 문서는 전체 목록에서 보세요.
          </p>
        </div>
        <PublicContentTrackedLink
          href={serviceHref}
          className="w-fit text-[13px] font-semibold text-[#555] no-underline underline-offset-4 transition-colors hover:text-[#111] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
          trackingParams={{
            channel,
            link_kind: "service_nav",
            service,
            target_title: `${serviceLabel} 전체 문서`,
          }}
        >
          전체 {articles.length}개 보기 <span aria-hidden="true">→</span>
        </PublicContentTrackedLink>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {visibleArticles.map((article) => (
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
      <details className="rounded-lg border border-[#e5e5e5] bg-white p-4 xl:hidden">
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
    <aside className="absolute inset-y-0 right-full mr-8 hidden w-40 xl:block">
      <nav
        className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto border-l border-[#e5e5e5] pl-4"
        aria-label="본문 목차"
      >
        <p className="mb-3 text-[12px] font-semibold text-[#555]">본문 목차</p>
        {links}
      </nav>
    </aside>
  );
}

export function getPublicContentHomeMetadata(
  channel: PublicContentChannel
): YeonPageMetadata {
  const config = getPublicContentChannelConfig(channel);
  const imageUrl = buildPublicContentOpenGraphImageUrl(channel);

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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.title} | YEON`,
      description: config.description,
      images: [imageUrl],
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
    const imageUrl = buildPublicContentOpenGraphImageUrl(article.channel);

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
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.description,
        images: [imageUrl],
      },
    };
  }

  const collection = getPublicContentCollectionBySlug(channel, slug);
  if (collection) {
    const imageUrl = buildPublicContentOpenGraphImageUrl(channel);

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
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: collection.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: collection.title,
        description: collection.description,
        images: [imageUrl],
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

function getPublicContentHomeHeroClassName(channel: PublicContentChannel) {
  if (channel === PUBLIC_CONTENT_CHANNELS.blog) {
    return "mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-14";
  }

  return "mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16";
}

export function PublicContentHome({
  channel,
  supportSearchQuery,
}: PublicContentHomeProps) {
  const config = getPublicContentChannelConfig(channel);
  const newsHomeModel =
    channel === PUBLIC_CONTENT_CHANNELS.news
      ? getPublicContentNewsHomeModel()
      : null;
  const blogHomeModel =
    channel === PUBLIC_CONTENT_CHANNELS.blog
      ? getPublicContentBlogHomeModel()
      : null;
  const supportServices =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? Object.values(PUBLIC_CONTENT_SERVICES)
      : [];
  const normalizedSupportSearchQuery =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? normalizePublicContentSearchQuery(supportSearchQuery)
      : "";
  const supportSearchResults = normalizedSupportSearchQuery
    ? searchPublicContentSupportArticles(normalizedSupportSearchQuery)
    : [];
  const supportProblemEntries =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? getPublicContentSupportHomeProblemEntries()
      : [];
  const supportNoticeEntry =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? getPublicContentSupportHomeNoticeEntry()
      : null;
  const supportServiceEntries =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? getPublicContentSupportHomeServiceEntries()
      : [];
  const supportReportEntry =
    channel === PUBLIC_CONTENT_CHANNELS.support
      ? getPublicContentSupportHomeReportEntry()
      : null;

  return (
    <PublicContentShell channel={channel}>
      <YeonStructuredData
        id={`${channel}-home-jsonld`}
        data={getJsonLdForHome(channel)}
      />
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportHomeHero
          description={config.homeDescription}
          eyebrow={config.homeEyebrow}
          noticeEntry={supportNoticeEntry}
          title={config.homeTitle}
        />
      ) : (
        <section className={getPublicContentHomeHeroClassName(channel)}>
          <div>
            <p className="text-[13px] font-semibold text-[#555]">
              {config.homeEyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-[40px] font-semibold leading-tight text-[#111] md:text-[48px]">
              {config.homeTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#666]">
              {config.homeDescription}
            </p>
          </div>
        </section>
      )}
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportSearch
          query={normalizedSupportSearchQuery}
          results={supportSearchResults}
        />
      ) : null}
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportHomeServiceEntries
          entries={supportServiceEntries}
        />
      ) : null}
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportHomeProblemEntries
          entries={supportProblemEntries}
        />
      ) : null}
      {newsHomeModel ? (
        <PublicContentNewsHomePriority model={newsHomeModel} />
      ) : null}
      {blogHomeModel ? (
        <PublicContentBlogHomePriority model={blogHomeModel} />
      ) : null}
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <section
          id="support-documents"
          className="mx-auto max-w-6xl px-6 pb-8 md:px-8"
        >
          {supportServices.map((service) => (
            <ServiceSection key={service} channel={channel} service={service} />
          ))}
        </section>
      ) : null}
      {channel === PUBLIC_CONTENT_CHANNELS.support ? (
        <PublicContentSupportHomeReportCta entry={supportReportEntry} />
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
          <p className="text-[13px] font-semibold text-[#555]">
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
  const tableOfContents = shouldShowPublicContentTableOfContents(article)
    ? buildPublicContentTableOfContents(article)
    : [];
  const hasTableOfContents = tableOfContents.length > 0;
  const headingIdByBlockIndex = new Map(
    tableOfContents.map((item) => [item.blockIndex, item.id])
  );
  const breadcrumbItems = buildPublicContentArticleBreadcrumb(article);
  const headerMetaItems = getPublicContentArticleHeaderMetaItems(article);

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
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-[#555]">
          {headerMetaItems.map((item, index) => (
            <span key={item} className="contents">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span>{item}</span>
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-[36px] font-semibold leading-tight text-[#111] md:text-[48px]">
          {article.title}
        </h1>
        <p className="mt-5 max-w-[760px] text-[17px] leading-8 text-[#666]">
          {article.description}
        </p>
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
        <div className="mt-8 border-t border-[#e5e5e5] pt-8">
          {hasTableOfContents ? (
            <PublicContentTableOfContents
              items={tableOfContents}
              variant="mobile"
            />
          ) : null}
          <div className={hasTableOfContents ? "relative mt-8" : undefined}>
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
          <div className="mt-10 border-t border-[#e5e5e5] pt-5">
            <PublicContentTrackedLink
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-[#111] px-4 py-2.5 text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
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
              <span aria-hidden="true">→</span>
            </PublicContentTrackedLink>
          </div>
        ) : null}
        <PublicContentRelatedArticles articles={relatedArticles} />
      </article>
    </PublicContentShell>
  );
}
