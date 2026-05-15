import sanitizeHtmlLib from "sanitize-html";

const CLOUDINARY_HOSTNAME = "res.cloudinary.com";

const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "strong",
  "em",
  "u",
  "s",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "pre",
  "code",
  "span",
];

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      span: ["class"],
      code: ["class"],
      pre: ["class"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["https"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            href,
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        };
      },
    },
    exclusiveFilter: (frame) => {
      if (frame.tag === "img") {
        const src = frame.attribs.src ?? "";
        try {
          const url = new URL(src);
          return url.hostname !== CLOUDINARY_HOSTNAME;
        } catch {
          return true;
        }
      }
      return false;
    },
    allowedClasses: {
      span: ["hljs-*"],
      code: ["language-*", "hljs", "hljs-*"],
      pre: ["language-*"],
    },
  });
}
