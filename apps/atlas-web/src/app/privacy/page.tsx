import type { Metadata } from "next";
import { StatePanel } from "@/components/editorial/state-panel";
import { privacySurface } from "@/content/resilience";

export const metadata: Metadata = {
  title: privacySurface.seo.title,
  description: privacySurface.seo.description,
};

export default function PrivacyPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <StatePanel data={privacySurface} />
    </main>
  );
}
