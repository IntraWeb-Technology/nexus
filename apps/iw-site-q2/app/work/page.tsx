import type { Metadata } from "next";
import { Btn } from "@/components/primitives";

export const metadata: Metadata = {
  title: "Work | IntraWeb Technologies",
  description:
    "Case studies and systems IntraWeb has shipped for SMBs: automation, integrations, and web platforms.",
};

export default function WorkPage() {
  return (
    <div className="container page-inner">
      <h1>Real systems. Real results.</h1>
      <p className="lead">
        Every engagement is different. This section will host case studies as they are published: client type,
        challenge, what we built, quantified outcomes, and service tags.
      </p>

      <div
        className="card"
        style={{ padding: 32, maxWidth: 720, border: "1px solid var(--iw-hairline)", borderRadius: "var(--r-md)" }}
      >
        <h2 style={{ fontSize: 22 }}>Want to be in this section?</h2>
        <p style={{ marginTop: 12, color: "var(--iw-fg-2)" }}>
          We&apos;re selectively taking on new clients. Start with a Diagnostic and we&apos;ll tell you honestly whether
          IntraWeb is the right fit.
        </p>
        <div style={{ marginTop: 24 }}>
          <Btn variant="primary" href="/diagnostic">
            Book a Diagnostic
          </Btn>
        </div>
      </div>
    </div>
  );
}
