import Link from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof Link>;

/**
 * In-page hash hrefs must use a native <a>.
 * Next.js <Link href="#section"> still runs App Router soft navigation and
 * fetches an RSC payload for the current route — which surfaces as
 * `TypeError: Failed to fetch` in createFetch when the dev server is
 * restarting, compiling, or briefly unreachable.
 */
export function isInPageHashHref(
  href: AppLinkProps["href"],
): href is `#${string}` {
  return typeof href === "string" && href.startsWith("#");
}

export function AppLink(props: AppLinkProps) {
  if (isInPageHashHref(props.href)) {
    const { href, className, children, id, style, title, target, rel } = props;
    return (
      <a
        href={href}
        className={className}
        id={id}
        style={style}
        title={title}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }

  return <Link {...props} />;
}
