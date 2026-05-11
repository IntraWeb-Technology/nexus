import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Get started | Tell us what you're working on" },
  description:
    "Start your project with IntraWeb. Share your goals, timeline, and context in our full project intake form.",
  alternates: {
    canonical: "/start",
  },
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
