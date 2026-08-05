import type { Metadata } from "next";
import { confirmDataDeletionRequest } from "@/lib/data-deletion-confirm";
import { privacyEmail } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirm data request",
  robots: { index: false, follow: false },
};

export default async function DataDeletionConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ request_id?: string; email?: string; token?: string }>;
}) {
  const params = await searchParams;
  const requestId = params.request_id ?? "";
  const email = params.email ?? "";
  const token = params.token ?? "";

  let result = {
    ok: false,
    title: "Missing information",
    message: "This confirmation link is incomplete. Please use the link from your email.",
  };

  if (requestId && email && token) {
    result = await confirmDataDeletionRequest({ requestId, email, token });
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-[#c8d1da]">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8d9aa7]">Privacy</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">{result.title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#c8d1da]">{result.message}</p>
      <p className="mt-8 text-sm">
        <Link href="/data-deletion" className="text-[#f5a623] hover:underline">
          Back to data deletion
        </Link>
        {" · "}
        <a href={`mailto:${privacyEmail}`} className="text-[#f5a623] hover:underline">
          {privacyEmail}
        </a>
      </p>
    </main>
  );
}
