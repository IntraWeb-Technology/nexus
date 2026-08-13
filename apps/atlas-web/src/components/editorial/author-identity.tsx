import Image from "next/image";
import type { ArticleAuthor } from "@/content/article";

type AuthorIdentityProps = {
  author: ArticleAuthor;
  /** Portrait size in px — featured uses 36, header uses 34–42. */
  size?: number;
};

/**
 * Author portrait + name lockup — shared by Articles featured and Article header.
 */
export function AuthorIdentity({ author, size = 36 }: AuthorIdentityProps) {
  return (
    <div className="flex items-start gap-2.5">
      <Image
        src={author.portraitSrc}
        alt={author.portraitAlt}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
      <div className="min-w-0">
        <p className="m-0 font-sans text-[9px] font-medium leading-3 tracking-[0.08em] text-atlas-sage uppercase">
          Author
        </p>
        <p className="m-0 font-sans text-[13px] leading-[18px] font-semibold text-atlas-ink">
          {author.name}
        </p>
      </div>
    </div>
  );
}
