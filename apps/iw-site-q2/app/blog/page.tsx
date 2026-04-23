import type { Metadata } from "next";
import { Btn } from "@/components/primitives";

export const metadata: Metadata = {
  title: { absolute: "Blog | IntraWeb" },
  description: "Notes on AI, automation, and web systems for operators.",
};

export default function BlogPage() {
  return (
    <div className="container page-inner">
      <h1>Blog</h1>
      <p className="lead">Articles and updates are coming soon. In the meantime, start with a diagnostic to map your automation opportunities.</p>
      <Btn href="/diagnostic" variant="primary">
        Book an AI Workflow Diagnostic
      </Btn>
    </div>
  );
}
