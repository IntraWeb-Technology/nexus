import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for IntraWeb Technologies LLC.",
};

export default function TermsPage() {
  return (
    <div className="container page-inner">
      <h1>Terms</h1>
      <p className="lead">
        This marketing site is a starter implementation. Replace this page with your real terms of service before you
        onboard paying clients through the site.
      </p>
    </div>
  );
}
