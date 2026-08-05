import { isValidDate } from "./lib/dates";
import type {
  ArticlePlan,
  CaseStudyPlan,
  FaqPlan,
  NavPlan,
  ProjectPlan,
  ValidationIssue,
} from "./types";

function issue(
  domain: ValidationIssue["domain"],
  identifier: string,
  field: string,
  message: string,
  severity: ValidationIssue["severity"],
  sourceFile?: string
): ValidationIssue {
  return { domain, identifier, field, message, severity, sourceFile };
}

export function validateArticle(plan: ArticlePlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = plan.slug || plan.title || "(unknown)";
  if (!plan.title) issues.push(issue("articles", id, "title", "Missing title", "error", plan.sourceFile));
  if (!plan.slug) issues.push(issue("articles", id, "slug", "Missing/unresolvable slug", "error", plan.sourceFile));
  if (!plan.body) issues.push(issue("articles", id, "body", "Empty body", "error", plan.sourceFile));
  if (!plan.sites.length) issues.push(issue("articles", id, "sites", "No site assigned", "error", plan.sourceFile));
  if (plan.publishedDate && !isValidDate(plan.publishedDate)) {
    issues.push(issue("articles", id, "publishedDate", "Unparseable date", "warning", plan.sourceFile));
  }
  if (!plan.publishedDate) {
    issues.push(issue("articles", id, "publishedDate", "Missing publish date", "warning", plan.sourceFile));
  }
  if (!plan.excerpt) {
    issues.push(issue("articles", id, "excerpt", "Empty excerpt (derived fallback failed)", "warning", plan.sourceFile));
  }
  return issues;
}

export function validateProject(plan: ProjectPlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = plan.slug || plan.name || "(unknown)";
  if (!plan.name) issues.push(issue("projects", id, "name", "Missing name", "error", plan.sourceFile));
  if (!plan.slug) issues.push(issue("projects", id, "slug", "Missing/unresolvable slug", "error", plan.sourceFile));
  if (!plan.sites.length) issues.push(issue("projects", id, "sites", "No site assigned", "error", plan.sourceFile));
  if (!plan.description) issues.push(issue("projects", id, "description", "Empty description", "warning", plan.sourceFile));
  return issues;
}

export function validateCaseStudy(plan: CaseStudyPlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = plan.slug || plan.title || "(unknown)";
  if (!plan.title) issues.push(issue("case-studies", id, "title", "Missing title", "error", plan.sourceFile));
  if (!plan.slug) issues.push(issue("case-studies", id, "slug", "Missing/unresolvable slug", "error", plan.sourceFile));
  if (!plan.sites.length) issues.push(issue("case-studies", id, "sites", "No site assigned", "error", plan.sourceFile));
  if (!plan.challenge) issues.push(issue("case-studies", id, "challenge", "Empty challenge section", "warning", plan.sourceFile));
  if (!plan.solution) issues.push(issue("case-studies", id, "solution", "Empty solution section", "warning", plan.sourceFile));
  if (!plan.results) issues.push(issue("case-studies", id, "results", "Empty results section", "warning", plan.sourceFile));
  return issues;
}

export function validateFaq(plan: FaqPlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = plan.question || "(unknown)";
  if (!plan.question) issues.push(issue("faq", id, "question", "Missing question", "error", plan.sourceFile));
  if (!plan.answer) issues.push(issue("faq", id, "answer", "Missing answer", "error", plan.sourceFile));
  if (!plan.sites.length) issues.push(issue("faq", id, "sites", "No site assigned", "error", plan.sourceFile));
  return issues;
}

export function validateNav(plan: NavPlan): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const id = plan.name || "(unknown)";
  if (!plan.items.length) issues.push(issue("nav", id, "items", "No nav items found", "error", plan.sourceFile));
  return issues;
}
