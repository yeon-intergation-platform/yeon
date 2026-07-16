import { z } from "zod";

export const PUBLIC_CONTENT_CHANNELS = {
  support: "support",
  news: "news",
  blog: "blog",
} as const;

export const PUBLIC_CONTENT_SERVICE_KEYS = {
  nexa: "nexa",
  typing: "typing",
  card: "card",
  community: "community",
  account: "account",
  yeon: "yeon",
} as const;

export const PUBLIC_CONTENT_CATEGORIES = {
  gettingStarted: "getting-started",
  guides: "guides",
  tutorials: "tutorials",
  troubleshooting: "troubleshooting",
  faq: "faq",
  policy: "policy",
  notice: "notice",
  updates: "updates",
  news: "news",
  engineering: "engineering",
  product: "product",
  devlog: "devlog",
  essay: "essay",
} as const;

export const PUBLIC_CONTENT_STATUSES = {
  draft: "draft",
  review: "review",
  published: "published",
  archived: "archived",
} as const;

export const PUBLIC_CONTENT_VISIBILITY = {
  public: "public",
  unlisted: "unlisted",
  internal: "internal",
} as const;

export const PUBLIC_CONTENT_BODY_FORMATS = {
  markdown: "markdown",
  portableText: "portable_text",
} as const;

export const PUBLIC_CONTENT_CHANGE_FREQUENCIES = {
  weekly: "weekly",
  monthly: "monthly",
  yearly: "yearly",
} as const;

export const publicContentChannelSchema = z.enum([
  PUBLIC_CONTENT_CHANNELS.support,
  PUBLIC_CONTENT_CHANNELS.news,
  PUBLIC_CONTENT_CHANNELS.blog,
]);
export type PublicContentChannel = z.infer<typeof publicContentChannelSchema>;

export const publicContentServiceKeySchema = z.enum([
  PUBLIC_CONTENT_SERVICE_KEYS.nexa,
  PUBLIC_CONTENT_SERVICE_KEYS.typing,
  PUBLIC_CONTENT_SERVICE_KEYS.card,
  PUBLIC_CONTENT_SERVICE_KEYS.community,
  PUBLIC_CONTENT_SERVICE_KEYS.account,
  PUBLIC_CONTENT_SERVICE_KEYS.yeon,
]);
export type PublicContentServiceKey = z.infer<
  typeof publicContentServiceKeySchema
>;

export const publicContentCategorySchema = z.enum([
  PUBLIC_CONTENT_CATEGORIES.gettingStarted,
  PUBLIC_CONTENT_CATEGORIES.guides,
  PUBLIC_CONTENT_CATEGORIES.tutorials,
  PUBLIC_CONTENT_CATEGORIES.troubleshooting,
  PUBLIC_CONTENT_CATEGORIES.faq,
  PUBLIC_CONTENT_CATEGORIES.policy,
  PUBLIC_CONTENT_CATEGORIES.notice,
  PUBLIC_CONTENT_CATEGORIES.updates,
  PUBLIC_CONTENT_CATEGORIES.news,
  PUBLIC_CONTENT_CATEGORIES.engineering,
  PUBLIC_CONTENT_CATEGORIES.product,
  PUBLIC_CONTENT_CATEGORIES.devlog,
  PUBLIC_CONTENT_CATEGORIES.essay,
]);
export type PublicContentCategory = z.infer<typeof publicContentCategorySchema>;

export const publicContentStatusSchema = z.enum([
  PUBLIC_CONTENT_STATUSES.draft,
  PUBLIC_CONTENT_STATUSES.review,
  PUBLIC_CONTENT_STATUSES.published,
  PUBLIC_CONTENT_STATUSES.archived,
]);
export type PublicContentStatus = z.infer<typeof publicContentStatusSchema>;

export const publicContentVisibilitySchema = z.enum([
  PUBLIC_CONTENT_VISIBILITY.public,
  PUBLIC_CONTENT_VISIBILITY.unlisted,
  PUBLIC_CONTENT_VISIBILITY.internal,
]);
export type PublicContentVisibility = z.infer<
  typeof publicContentVisibilitySchema
>;

export const publicContentBodyFormatSchema = z.enum([
  PUBLIC_CONTENT_BODY_FORMATS.markdown,
  PUBLIC_CONTENT_BODY_FORMATS.portableText,
]);
export type PublicContentBodyFormat = z.infer<
  typeof publicContentBodyFormatSchema
>;

export const publicContentChangeFrequencySchema = z.enum([
  PUBLIC_CONTENT_CHANGE_FREQUENCIES.weekly,
  PUBLIC_CONTENT_CHANGE_FREQUENCIES.monthly,
  PUBLIC_CONTENT_CHANGE_FREQUENCIES.yearly,
]);
export type PublicContentChangeFrequency = z.infer<
  typeof publicContentChangeFrequencySchema
>;

export const publicContentSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(240)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/);

const publicContentOptionalUrlSchema = z.string().url().max(2048).nullable();
const publicContentCtaHrefSchema = z
  .union([
    z.string().url().max(2048),
    z
      .string()
      .trim()
      .regex(/^\/[^\s]*$/)
      .max(2048),
  ])
  .nullable();

export const publicContentListQuerySchema = z.object({
  channel: publicContentChannelSchema.optional(),
  serviceKey: publicContentServiceKeySchema.optional(),
  category: publicContentCategorySchema.optional(),
});
export type PublicContentListQuery = z.infer<
  typeof publicContentListQuerySchema
>;

export const publicContentAdminListQuerySchema =
  publicContentListQuerySchema.extend({
    status: publicContentStatusSchema.optional(),
    visibility: publicContentVisibilitySchema.optional(),
  });
export type PublicContentAdminListQuery = z.infer<
  typeof publicContentAdminListQuerySchema
>;

export const publicContentArticleSummaryDtoSchema = z.object({
  channel: publicContentChannelSchema,
  serviceKey: publicContentServiceKeySchema,
  category: publicContentCategorySchema,
  slug: publicContentSlugSchema,
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(240),
  summary: z.string().min(1).max(320),
  canonicalUrl: z.string().url().max(2048),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  readingMinutes: z.number().int().positive(),
});
export type PublicContentArticleSummaryDto = z.infer<
  typeof publicContentArticleSummaryDtoSchema
>;

export const publicContentArticleDetailDtoSchema =
  publicContentArticleSummaryDtoSchema.extend({
    bodyFormat: publicContentBodyFormatSchema.default(
      PUBLIC_CONTENT_BODY_FORMATS.markdown
    ),
    bodyMarkdown: z.string().min(1).max(120000),
    ctaLabel: z.string().min(1).max(80).nullable(),
    ctaHref: publicContentCtaHrefSchema,
    metaTitle: z.string().min(1).max(180).nullable().default(null),
    metaDescription: z.string().min(1).max(260).nullable().default(null),
    ogImageUrl: publicContentOptionalUrlSchema.default(null),
  });
export type PublicContentArticleDetailDto = z.infer<
  typeof publicContentArticleDetailDtoSchema
>;

export const publicContentAdminArticleDtoSchema =
  publicContentArticleDetailDtoSchema.extend({
    id: z.string().min(1).max(80),
    publishedAt: z.string().datetime().nullable(),
    status: publicContentStatusSchema,
    visibility: publicContentVisibilitySchema,
    noindex: z.boolean().default(false),
    metaTitle: z.string().min(1).max(180).nullable(),
    metaDescription: z.string().min(1).max(260).nullable(),
    ogImageUrl: publicContentOptionalUrlSchema,
    authorKey: z.string().min(1).max(80),
    sourceRepo: z.string().min(1).max(160).nullable(),
    sourcePaths: z.array(z.string().min(1).max(2048)).default([]),
    redirectTo: publicContentOptionalUrlSchema,
    version: z.number().int().positive().default(1),
    publishedRevisionId: z.string().min(1).max(80).nullable().default(null),
  });
export type PublicContentAdminArticleDto = z.infer<
  typeof publicContentAdminArticleDtoSchema
>;

const publicContentNullableTextSchema = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable();

const publicContentEditableArticleFieldsSchema = z
  .object({
    channel: publicContentChannelSchema,
    serviceKey: publicContentServiceKeySchema,
    category: publicContentCategorySchema,
    slug: publicContentSlugSchema,
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(240),
    summary: z.string().trim().min(1).max(320),
    bodyFormat: z
      .literal(PUBLIC_CONTENT_BODY_FORMATS.markdown)
      .default(PUBLIC_CONTENT_BODY_FORMATS.markdown),
    bodyMarkdown: z.string().trim().min(1).max(120000),
    ctaLabel: publicContentNullableTextSchema(80),
    ctaHref: publicContentCtaHrefSchema,
    visibility: publicContentVisibilitySchema,
    noindex: z.boolean(),
    metaTitle: publicContentNullableTextSchema(180),
    metaDescription: publicContentNullableTextSchema(260),
    ogImageUrl: publicContentOptionalUrlSchema,
    authorKey: z.string().trim().min(1).max(80),
    sourceRepo: publicContentNullableTextSchema(160),
    sourcePaths: z.array(z.string().trim().min(1).max(2048)).max(100),
    redirectTo: publicContentOptionalUrlSchema,
  })
  .strict();

export const createPublicContentArticleBodySchema =
  publicContentEditableArticleFieldsSchema;
export type CreatePublicContentArticleBody = z.infer<
  typeof createPublicContentArticleBodySchema
>;

export const updatePublicContentArticleBodySchema =
  publicContentEditableArticleFieldsSchema.extend({
    version: z.number().int().positive(),
  });
export type UpdatePublicContentArticleBody = z.infer<
  typeof updatePublicContentArticleBodySchema
>;

export const transitionPublicContentArticleBodySchema = z
  .object({
    version: z.number().int().positive(),
  })
  .strict();
export type TransitionPublicContentArticleBody = z.infer<
  typeof transitionPublicContentArticleBodySchema
>;

export const publicContentRevisionDtoSchema = z.object({
  id: z.string().min(1).max(80),
  articleId: z.string().min(1).max(80),
  revisionNumber: z.number().int().positive(),
  title: z.string().min(1).max(160),
  bodyMarkdown: z.string().min(1).max(120000),
  publishedAt: z.string().datetime(),
  createdBy: z.string().uuid().nullable(),
});
export type PublicContentRevisionDto = z.infer<
  typeof publicContentRevisionDtoSchema
>;

export const publicContentRevisionListResponseSchema = z.object({
  revisions: z.array(publicContentRevisionDtoSchema),
});
export type PublicContentRevisionListResponse = z.infer<
  typeof publicContentRevisionListResponseSchema
>;

export const publicContentImportManuscriptFrontmatterSchema = z
  .object({
    schema_version: z.literal("1").default("1"),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(240),
    summary: z.string().trim().min(1).max(320).optional(),
    channel: publicContentChannelSchema,
    service: publicContentServiceKeySchema,
    category: publicContentCategorySchema,
    slug: publicContentSlugSchema,
    status: publicContentStatusSchema,
    visibility: publicContentVisibilitySchema.optional(),
    noindex: z.enum(["true", "false"]).optional(),
    meta_title: z.string().trim().min(1).max(180).optional(),
    meta_description: z.string().trim().min(1).max(260).optional(),
    og_image_url: z.string().url().max(2048).optional(),
    cta_label: z.string().trim().min(1).max(80).optional(),
    cta_href: z.string().trim().min(1).max(2048).optional(),
    author_key: z.string().trim().min(1).max(80).optional(),
    source_repo: z.string().trim().min(1).max(160),
    source_path: z.array(z.string().trim().min(1).max(2048)).default([]),
    redirect_to: z.string().url().max(2048).optional(),
    content_version: z.string().regex(/^\d+$/).optional(),
  })
  .strict();
export type PublicContentImportManuscriptFrontmatter = z.infer<
  typeof publicContentImportManuscriptFrontmatterSchema
>;

export const publicContentSitemapEntryDtoSchema = z.object({
  url: z.string().url().max(2048),
  lastModified: z.string().datetime(),
  changeFrequency: publicContentChangeFrequencySchema,
  priority: z.number().min(0).max(1),
});
export type PublicContentSitemapEntryDto = z.infer<
  typeof publicContentSitemapEntryDtoSchema
>;

export const publicContentArticleListResponseSchema = z.object({
  articles: z.array(publicContentArticleSummaryDtoSchema),
});
export type PublicContentArticleListResponse = z.infer<
  typeof publicContentArticleListResponseSchema
>;

export const publicContentArticleResponseSchema = z.object({
  article: publicContentArticleDetailDtoSchema,
});
export type PublicContentArticleResponse = z.infer<
  typeof publicContentArticleResponseSchema
>;

export const publicContentRedirectResponseSchema = z.object({
  redirectTo: z.string().url().max(2048),
});
export type PublicContentRedirectResponse = z.infer<
  typeof publicContentRedirectResponseSchema
>;

export const publicContentSnapshotResponseSchema = z.object({
  articles: z.array(publicContentArticleDetailDtoSchema),
});
export type PublicContentSnapshotResponse = z.infer<
  typeof publicContentSnapshotResponseSchema
>;

export const publicContentSitemapResponseSchema = z.object({
  entries: z.array(publicContentSitemapEntryDtoSchema),
});
export type PublicContentSitemapResponse = z.infer<
  typeof publicContentSitemapResponseSchema
>;

export const publicContentAdminArticleListResponseSchema = z.object({
  articles: z.array(publicContentAdminArticleDtoSchema),
});
export type PublicContentAdminArticleListResponse = z.infer<
  typeof publicContentAdminArticleListResponseSchema
>;

export const publicContentAdminArticleResponseSchema = z.object({
  article: publicContentAdminArticleDtoSchema,
});
export type PublicContentAdminArticleResponse = z.infer<
  typeof publicContentAdminArticleResponseSchema
>;

export const PUBLIC_CONTENT_API_PATHS = {
  publicList: "/api/v1/content",
  publicSnapshot: "/api/v1/content/snapshot",
  publicArticle(channel: PublicContentChannel, slug: string) {
    return `/api/v1/content/${channel}/${slug}`;
  },
  publicRedirect(channel: PublicContentChannel) {
    return `/api/v1/content/${channel}/redirect`;
  },
  publicSitemap(channel: PublicContentChannel) {
    return `/api/v1/content/${channel}/sitemap`;
  },
  adminList: "/api/v1/admin/content",
  adminArticle(articleId: string) {
    return `/api/v1/admin/content/${articleId}`;
  },
  adminReview(articleId: string) {
    return `/api/v1/admin/content/${articleId}/review`;
  },
  adminPublish(articleId: string) {
    return `/api/v1/admin/content/${articleId}/publish`;
  },
  adminArchive(articleId: string) {
    return `/api/v1/admin/content/${articleId}/archive`;
  },
  adminRestore(articleId: string) {
    return `/api/v1/admin/content/${articleId}/restore`;
  },
  adminRevisions(articleId: string) {
    return `/api/v1/admin/content/${articleId}/revisions`;
  },
  adminExport(articleId: string) {
    return `/api/v1/admin/content/${articleId}/export`;
  },
  adminBatchExport: "/api/v1/admin/content/export",
} as const;
