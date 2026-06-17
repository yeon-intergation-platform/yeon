import {
  buildPublicContentCanonicalUrl,
  getPublicContentCategoryLabel,
  getPublicContentCollections,
  getPublicContentServiceLabel,
  PUBLIC_CONTENT_CATEGORY_LABELS,
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_SERVICES,
  type PublicContentChannel,
  type PublicContentCollection,
  type PublicContentService,
} from "./public-content-data";

export type PublicContentNavigationItem = {
  active: boolean;
  count: number;
  href: string;
  key: string;
  label: string;
  slugSegments: readonly string[];
};

type PublicContentServiceNavParams = {
  activeService?: PublicContentService;
  channel: PublicContentChannel;
  parentCategory?: string;
};

type PublicContentCategoryNavParams = {
  activeCategory?: string;
  channel: PublicContentChannel;
  service?: PublicContentService;
};

const PUBLIC_CONTENT_SERVICE_ORDER = Object.values(PUBLIC_CONTENT_SERVICES);
const PUBLIC_CONTENT_CATEGORY_ORDER = Object.keys(
  PUBLIC_CONTENT_CATEGORY_LABELS
);

export function isPublicContentService(
  value: string | undefined
): value is PublicContentService {
  if (!value) return false;

  return PUBLIC_CONTENT_SERVICE_ORDER.some((service) => service === value);
}

function compareByOrder(order: readonly string[]) {
  return (left: string, right: string) => {
    const leftIndex = order.indexOf(left);
    const rightIndex = order.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;

    return leftIndex - rightIndex;
  };
}

function toNavigationItem({
  active,
  collection,
  label,
}: {
  active: boolean;
  collection: PublicContentCollection;
  label: string;
}): PublicContentNavigationItem {
  return {
    active,
    count: collection.articles.length,
    href: buildPublicContentCanonicalUrl(
      collection.channel,
      collection.slugSegments
    ),
    key: collection.slugSegments.join("/"),
    label,
    slugSegments: collection.slugSegments,
  };
}

export function getPublicContentServiceNavItems({
  activeService,
  channel,
  parentCategory,
}: PublicContentServiceNavParams): PublicContentNavigationItem[] {
  return getPublicContentCollections(channel)
    .flatMap((collection) => {
      const [firstSegment, secondSegment] = collection.slugSegments;

      if (channel === PUBLIC_CONTENT_CHANNELS.support) {
        if (
          collection.slugSegments.length !== 1 ||
          !isPublicContentService(firstSegment)
        ) {
          return [];
        }

        return [
          {
            collection,
            service: firstSegment,
          },
        ];
      }

      if (
        !parentCategory ||
        collection.slugSegments.length !== 2 ||
        firstSegment !== parentCategory ||
        !isPublicContentService(secondSegment)
      ) {
        return [];
      }

      return [
        {
          collection,
          service: secondSegment,
        },
      ];
    })
    .sort((left, right) =>
      compareByOrder(PUBLIC_CONTENT_SERVICE_ORDER)(left.service, right.service)
    )
    .map(({ collection, service }) =>
      toNavigationItem({
        active: activeService === service,
        collection,
        label: getPublicContentServiceLabel(service),
      })
    );
}

export function getPublicContentCategoryNavItems({
  activeCategory,
  channel,
  service,
}: PublicContentCategoryNavParams): PublicContentNavigationItem[] {
  return getPublicContentCollections(channel)
    .flatMap((collection) => {
      const [firstSegment, secondSegment] = collection.slugSegments;

      if (channel === PUBLIC_CONTENT_CHANNELS.support) {
        if (
          !service ||
          collection.slugSegments.length !== 2 ||
          firstSegment !== service
        ) {
          return [];
        }

        return [
          {
            category: secondSegment,
            collection,
          },
        ];
      }

      if (collection.slugSegments.length !== 1) {
        return [];
      }

      return [
        {
          category: firstSegment,
          collection,
        },
      ];
    })
    .sort((left, right) =>
      compareByOrder(PUBLIC_CONTENT_CATEGORY_ORDER)(
        left.category,
        right.category
      )
    )
    .map(({ category, collection }) =>
      toNavigationItem({
        active: activeCategory === category,
        collection,
        label: getPublicContentCategoryLabel(category),
      })
    );
}
