import type { YeonIFrameElement, YeonDocument } from "@yeon/ui/types";
import {
  createYeonUrl,
  createYeonUrlSearchParams,
  type YeonUrl,
  type YeonUrlSearchParams,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  getYeonElementAttribute,
  queryYeonElements,
  removeYeonElement,
  setYeonElementAttribute,
} from "@yeon/ui/rich-content/YeonRichDom";

const YOUTUBE_IFRAME_TITLE = "YouTube video player";
const YOUTUBE_IFRAME_CLASS = "card-youtube-embed";
const YOUTUBE_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const YOUTUBE_IFRAME_REFERRER_POLICY = "strict-origin-when-cross-origin";
const YOUTUBE_VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_FULL_HOSTS = new Set(["youtube.com", "youtube-nocookie.com"]);
const MARKDOWN_STANDALONE_YOUTUBE_URL_REGEX =
  /(^|\n)([^\S\n]*)((?:https?:\/\/|www\.)[^\s<]+)(?=\n|$)/g;
const MARKDOWN_STANDALONE_YOUTUBE_LINK_REGEX =
  /(^|\n)([^\S\n]*)\[[^\]]+\]\(([^)\s]+)\)(?=\n|$)/g;
const HTML_STANDALONE_YOUTUBE_ANCHOR_REGEX =
  /<p>(?:\s|&nbsp;|<br\s*\/?>)*<a\b[^>]*href=(["'])(.*?)\1[^>]*>.*?<\/a>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;
const HTML_STANDALONE_YOUTUBE_TEXT_REGEX =
  /<p>(?:\s|&nbsp;|<br\s*\/?>)*((?:https?:\/\/|www\.)[^<\s]+)(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;

export interface CardEditorYouTubeEmbedInfo {
  videoId: string;
  originalUrl: string;
  embedUrl: string;
  startAt?: number;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/gi, (match, decimal: string) => {
      const cp = Number.parseInt(decimal, 10);
      return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    })
    .replace(/&#x([\da-f]+);/gi, (match, hex: string) => {
      const cp = Number.parseInt(hex, 16);
      return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    });
}

function normalizeUrlCandidate(value: string) {
  const trimmed = decodeHtmlEntities(value).trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (
    /^(?:https?:\/\/)/i.test(trimmed) ||
    /^(?:www\.)?(?:m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(
      trimmed
    )
  ) {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }

  return undefined;
}

function extractVideoIdFromPath(pathname: string, prefix: string) {
  const path = pathname.replace(/\/+$/, "");
  const segment = path.startsWith(prefix)
    ? path.slice(prefix.length).split("/")[0]
    : "";

  return YOUTUBE_VIDEO_ID_REGEX.test(segment) ? segment : undefined;
}

function extractVideoId(
  host: string,
  pathname: string,
  searchParams: YeonUrlSearchParams
) {
  if (host === "youtu.be") {
    return extractVideoIdFromPath(pathname, "/");
  }

  if (!YOUTUBE_FULL_HOSTS.has(host)) {
    return undefined;
  }

  if (pathname === "/watch") {
    return searchParams.get("v") ?? undefined;
  }

  return (
    extractVideoIdFromPath(pathname, "/shorts/") ??
    extractVideoIdFromPath(pathname, "/live/") ??
    extractVideoIdFromPath(pathname, "/embed/") ??
    extractVideoIdFromPath(pathname, "/v/")
  );
}

function parseYouTubeStartAt(raw: string | undefined) {
  if (!raw) return undefined;

  const decoded = decodeHtmlEntities(raw).trim();
  if (!decoded) {
    return undefined;
  }

  if (/^\d+$/.test(decoded)) {
    const seconds = Number.parseInt(decoded, 10);

    return seconds > 0 ? seconds : undefined;
  }

  const match = decoded.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);

  if (!match) {
    return undefined;
  }

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : undefined;
}

function getHashSearchParams(hash: string) {
  const trimmedHash = hash.replace(/^#/, "");

  if (!trimmedHash) return undefined;

  return createYeonUrlSearchParams(trimmedHash);
}

function buildYouTubeEmbedUrl({
  videoId,
  startAt,
}: Pick<CardEditorYouTubeEmbedInfo, "videoId" | "startAt">) {
  const url = createYeonUrl(
    `https://www.youtube-nocookie.com/embed/${videoId}`
  );

  if (startAt) {
    url.searchParams.set("start", String(startAt));
  }

  return url.toString();
}

export function extractCardEditorYouTubeEmbedInfo(value: string) {
  const normalizedUrl = normalizeUrlCandidate(value);

  if (!normalizedUrl) {
    return undefined;
  }

  let parsedUrl: YeonUrl;
  try {
    parsedUrl = createYeonUrl(normalizedUrl);
  } catch {
    return undefined;
  }

  const host = parsedUrl.hostname.replace(/^(?:www\.|m\.)/i, "").toLowerCase();
  const pathname = parsedUrl.pathname.replace(/\/+$/, "");
  const videoId = extractVideoId(host, pathname, parsedUrl.searchParams);

  if (!videoId || !YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
    return undefined;
  }

  const hashParams = getHashSearchParams(parsedUrl.hash);
  const startAt =
    parseYouTubeStartAt(parsedUrl.searchParams.get("start") ?? undefined) ??
    parseYouTubeStartAt(parsedUrl.searchParams.get("t") ?? undefined) ??
    parseYouTubeStartAt(hashParams?.get("start") ?? undefined) ??
    parseYouTubeStartAt(hashParams?.get("t") ?? undefined);

  return {
    videoId,
    originalUrl: parsedUrl.toString(),
    embedUrl: buildYouTubeEmbedUrl({ videoId, startAt }),
    startAt,
  };
}

export function buildCardEditorYouTubeEmbedAttrs(value: string) {
  const info = extractCardEditorYouTubeEmbedInfo(value);

  if (!info) {
    return undefined;
  }

  return {
    src: info.embedUrl,
    class: YOUTUBE_IFRAME_CLASS,
    title: YOUTUBE_IFRAME_TITLE,
    width: "560",
    height: "315",
    frameborder: "0",
    allow: YOUTUBE_IFRAME_ALLOW,
    loading: "lazy",
    referrerpolicy: YOUTUBE_IFRAME_REFERRER_POLICY,
    allowfullscreen: "true",
  };
}

export function createCardEditorYouTubeEmbedHtml(value: string) {
  const attrs = buildCardEditorYouTubeEmbedAttrs(value);

  if (!attrs) {
    return undefined;
  }

  const serializedAttrs = Object.entries(attrs)
    .map(([key, attrValue]) => `${key}="${attrValue}"`)
    .join(" ");

  return `<iframe ${serializedAttrs}></iframe>`;
}

export function applyCardEditorYouTubeIframeAttributes(
  yeonDocument: YeonDocument
) {
  queryYeonElements<YeonIFrameElement>(yeonDocument, "iframe").forEach(
    (iframeElement) => {
      const attrs = buildCardEditorYouTubeEmbedAttrs(
        getYeonElementAttribute(iframeElement, "src") ?? ""
      );

      if (!attrs) {
        removeYeonElement(iframeElement);
        return;
      }

      Object.entries(attrs).forEach(([key, value]) => {
        setYeonElementAttribute(iframeElement, key, value);
      });
    }
  );
}

function replaceStandaloneMarkdownYoutubeLinks(content: string) {
  const replaceBlock = (
    match: string,
    prefix: string,
    indent: string,
    candidateUrl: string
  ) => {
    const embedHtml = createCardEditorYouTubeEmbedHtml(candidateUrl);

    if (!embedHtml) {
      return match;
    }

    return `${prefix}${indent}${embedHtml}`;
  };

  return content
    .replace(
      MARKDOWN_STANDALONE_YOUTUBE_LINK_REGEX,
      (match, prefix: string, indent: string, candidateUrl: string) =>
        replaceBlock(match, prefix, indent, candidateUrl)
    )
    .replace(
      MARKDOWN_STANDALONE_YOUTUBE_URL_REGEX,
      (match, prefix: string, indent: string, candidateUrl: string) =>
        replaceBlock(match, prefix, indent, candidateUrl)
    );
}

function replaceStandaloneHtmlYoutubeLinks(content: string) {
  return content
    .replace(
      HTML_STANDALONE_YOUTUBE_ANCHOR_REGEX,
      (match, _quote: string, href: string) => {
        return createCardEditorYouTubeEmbedHtml(href) ?? match;
      }
    )
    .replace(
      HTML_STANDALONE_YOUTUBE_TEXT_REGEX,
      (match, candidateUrl: string) => {
        return createCardEditorYouTubeEmbedHtml(candidateUrl) ?? match;
      }
    );
}

export function replaceStandaloneCardEditorYouTubeLinksWithEmbeds(
  content: string,
  isHtmlContent: boolean
) {
  if (!content.trim()) {
    return content;
  }

  return isHtmlContent
    ? replaceStandaloneHtmlYoutubeLinks(content)
    : replaceStandaloneMarkdownYoutubeLinks(content);
}

export function isSingleCardEditorYouTubeUrlText(value: string) {
  const trimmed = decodeHtmlEntities(value).trim();

  if (!trimmed || /\s/.test(trimmed)) {
    return undefined;
  }

  return extractCardEditorYouTubeEmbedInfo(trimmed);
}
