/** Maps Strapi content-type UIDs to Atlas front-end paths (site: personal). */
export type PreviewDocument = Record<string, unknown> & {
  slug?: string;
  surface?: string;
};

export function getPreviewPathname(
  uid: string,
  document: PreviewDocument | null,
): string | null {
  if (!document) return null;

  switch (uid) {
    case "api::home-page.home-page":
      return "/";
    case "api::about-page.about-page":
      return "/about";
    case "api::work-page.work-page":
      return "/work";
    case "api::contact-page.contact-page":
      return "/contact";
    case "api::case-study.case-study": {
      const slug = document.slug;
      return typeof slug === "string" && slug ? `/work/${slug}` : null;
    }
    case "api::project.project":
      return "/work";
    case "api::article.article": {
      const slug = document.slug;
      if (typeof slug !== "string" || !slug) return null;
      return document.surface === "documentation"
        ? `/docs/${slug}`
        : `/articles/${slug}`;
    }
    default:
      return null;
  }
}
