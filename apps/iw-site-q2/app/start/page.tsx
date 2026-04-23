import WebsiteIntakeForm from "@/components/shared/website-intake-form";

export default function StartPage() {
  return (
    <main className="start-page">
      <div className="container" style={{ paddingTop: "var(--space-page-pt)", paddingBottom: "var(--space-page-bottom)" }}>
        <h1 className="start-page__title" style={{ margin: "0 0 1.5rem" }}>
          Tell us what you&apos;re working on
        </h1>
        <WebsiteIntakeForm />
      </div>
    </main>
  );
}
