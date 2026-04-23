import type { ReactNode } from "react";

export function JsonLd({ data }: { data: object | object[] }): ReactNode {
  const payload: object = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />;
}
