import {
  buildPublicContentInternalHref,
  getPublicContentCategoryLabel,
  getPublicContentChannelConfig,
  getPublicContentServiceLabel,
  PUBLIC_CONTENT_SERVICES,
  type PublicContentArticle,
  type PublicContentCollection,
  type PublicContentService,
} from "./public-content-data";

export type PublicContentBreadcrumbItem = {
  current: boolean;
  href: string;
  label: string;
  slugSegments: readonly string[];
};

function isPublicContentService(value: string): value is PublicContentService {
  return Object.values(PUBLIC_CONTENT_SERVICES).some(
    (service) => service === value
  );
}

function getBreadcrumbSegmentLabel(segment: string) {
  if (isPublicContentService(segment)) {
    return getPublicContentServiceLabel(segment);
  }

  return getPublicContentCategoryLabel(segment);
}

function buildCollectionBreadcrumbItems(
  collection: Pick<PublicContentCollection, "channel" | "slugSegments">
): PublicContentBreadcrumbItem[] {
  const config = getPublicContentChannelConfig(collection.channel);
  const items: PublicContentBreadcrumbItem[] = [
    {
      current: collection.slugSegments.length === 0,
      href: buildPublicContentInternalHref(collection.channel),
      label: config.label,
      slugSegments: [],
    },
  ];

  collection.slugSegments.forEach((segment, index) => {
    const slugSegments = collection.slugSegments.slice(0, index + 1);

    items.push({
      current: index === collection.slugSegments.length - 1,
      href: buildPublicContentInternalHref(collection.channel, slugSegments),
      label: getBreadcrumbSegmentLabel(segment),
      slugSegments,
    });
  });

  return items;
}

export function buildPublicContentCollectionBreadcrumb(
  collection: PublicContentCollection
): readonly PublicContentBreadcrumbItem[] {
  return buildCollectionBreadcrumbItems(collection);
}

export function buildPublicContentArticleBreadcrumb(
  article: PublicContentArticle
): readonly PublicContentBreadcrumbItem[] {
  const collectionItems = buildCollectionBreadcrumbItems({
    channel: article.channel,
    slugSegments: article.slugSegments.slice(0, -1),
  }).map((item) => ({
    ...item,
    current: false,
  }));

  return [
    ...collectionItems,
    {
      current: true,
      href: buildPublicContentInternalHref(
        article.channel,
        article.slugSegments
      ),
      label: article.title,
      slugSegments: article.slugSegments,
    },
  ];
}
