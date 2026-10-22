/**
 * Clinexus articles (blog). Add new articles to `articles` below.
 * Body is a list of simple blocks so posts render consistently.
 */

export type ArticleCategorySlug =
  | "practice"
  | "marketing"
  | "dental"
  | "eye-care"
  | "laboratory"
  | "technology";

export interface ArticleCategory {
  slug: ArticleCategorySlug;
  name: string;
  group: "Topics" | "Specialties";
  description: string;
}

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "tip"; title?: string; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategorySlug;
  publishedAt: string; // ISO date
  readMinutes: number;
  author: { name: string; role: string };
  cover?: string;
  featured?: boolean;
  body: ArticleBlock[];
}

export const articleCategories: ArticleCategory[] = [
  { slug: "practice", name: "Practice management", group: "Topics", description: "Running the clinic day to day — scheduling, staff, billing and stock." },
  { slug: "marketing", name: "Marketing", group: "Topics", description: "Finding new patients, keeping existing ones and building a local reputation." },
  { slug: "technology", name: "Technology & compliance", group: "Topics", description: "Records, data protection, consent and going paperless." },
  { slug: "dental", name: "Dental", group: "Specialties", description: "Charting, treatment plans, lab work and the dental chair." },
  { slug: "eye-care", name: "Eye care", group: "Specialties", description: "Exams, optical dispensing, contact lenses and diagnostics." },
  { slug: "laboratory", name: "Laboratory", group: "Specialties", description: "Test menus, sample flow, results and turnaround time." },
];

export const articles: Article[] = [];

export const getCategory = (slug?: string) => articleCategories.find((c) => c.slug === slug);
export const getArticle = (slug?: string) => articles.find((a) => a.slug === slug);

export const sortedArticles = () =>
  [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const articlesInCategory = (slug: ArticleCategorySlug) =>
  sortedArticles().filter((a) => a.category === slug);

export const relatedArticles = (article: Article, limit = 3) =>
  sortedArticles()
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, limit);

export const formatArticleDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
