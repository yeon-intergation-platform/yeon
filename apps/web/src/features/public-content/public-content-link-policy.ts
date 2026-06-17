export type PublicContentLinkRelParams = {
  href: string;
  rel?: string;
  target?: string;
};

function isAbsoluteWebUrl(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getPublicContentLinkRel({
  href,
  rel,
  target,
}: PublicContentLinkRelParams) {
  if (rel) return rel;

  if (target === "_blank") {
    return "noopener noreferrer";
  }

  if (isAbsoluteWebUrl(href)) {
    return "noopener";
  }

  return undefined;
}
