import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for IntraWeb Technologies, LLC.",
};

export default function PrivacyPage() {
  return (
    <div className="container page-inner">
      <h1>Privacy</h1>
      <p className="lead">
        This marketing site is a starter implementation. Replace this page with your real privacy policy before you
        collect personal data at scale.
      </p>
    </div>
  );
}
