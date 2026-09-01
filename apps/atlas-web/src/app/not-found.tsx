import type { Metadata } from "next";
import { StatePanel } from "@/components/editorial/state-panel";
import { notFoundSurface } from "@/content/resilience";

export const metadata: Metadata = {
  title: notFoundSurface.seo.title,
  description: notFoundSurface.seo.description,
};

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <StatePanel data={notFoundSurface} />
    </main>
  );
}
