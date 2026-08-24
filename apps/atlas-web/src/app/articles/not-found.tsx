import type { Metadata } from "next";
import { StatePanel } from "@/components/editorial/state-panel";
import { articleNotFoundSurface } from "@/content/resilience";

export const metadata: Metadata = {
  title: articleNotFoundSurface.seo.title,
  description: articleNotFoundSurface.seo.description,
};

export default function ArticlesNotFound() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <StatePanel data={articleNotFoundSurface} />
    </main>
  );
}
