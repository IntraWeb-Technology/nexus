export {
  shapeArticle,
  shapeCaseStudy,
  shapeFaqItem,
  shapeNavigation,
  shapePage,
  shapePagination,
  shapeProject,
  shapeRedirect,
  shapeService,
  shapeSiteSettings,
  shapeTestimonial,
} from "./content.js";

export {
  shapeAboutPage,
  shapeContactPage,
  shapeHomePage,
  shapeWorkPage,
} from "./atlas.js";

/** @deprecated Prefer `shapeArticle` — kept for README / early call sites. */
export { shapeArticle as normalizeArticle } from "./content.js";
