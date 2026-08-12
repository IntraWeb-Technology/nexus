/**
 * Unified Content API — Strapi (when enabled) → local markdown → Hashnode.
 * Soft-fails so the blog never blanks when one source is empty/down.
 *
 * Local blog files may be missing in this nexus copy; sync from portfolio-os:
 *   .../portfolio-os/apps/site/content/blog
 */

import {
  resolveBlogPostBySlug,
  resolveBlogPosts,
  resolveBlogSlugs,
  type UnifiedPost,
} from './strapi-content';
import { getLocalBlogSlugs } from './local-blog-loader';

export type { UnifiedPost };

export interface UnifiedPublication {
  id: string;
  title: string;
  description: string;
  url: string;
  favicon: string;
  logo: string;
  isTeam: boolean;
  preferences: {
    logo: string;
    darkMode: { logo: string };
    navbarItems: unknown[];
    layout: {
      navbarStyle: string;
      footerStyle: string;
      showBranding: boolean;
    };
    members: unknown[];
  };
  displayTitle?: string | null;
  descriptionSEO?: string;
  posts?: { totalDocuments: number };
  author?: { name: string; profilePicture: string | null };
  followersCount?: number;
  ogMetaData?: { image: string | null };
}

async function fetchHashnodePosts(first: number): Promise<UnifiedPost[]> {
  const host =
    process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST || 'mindware.hashnode.dev';
  const query = `
    query PostsByPublication($host: String!, $first: Int!) {
      publication(host: $host) {
        posts(first: $first) {
          edges {
            node {
              id
              title
              brief
              slug
              publishedAt
              coverImage { url }
              author { name }
              tags { name slug }
              readTimeInMinutes
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { host, first } }),
    next: { revalidate: 60 },
  });
  const data = await res.json();
  const edges = data?.data?.publication?.posts?.edges || [];
  return edges.map((e: { node: UnifiedPost }) => e.node);
}

async function fetchHashnodePostBySlug(
  slug: string,
): Promise<UnifiedPost | null> {
  const host =
    process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST || 'mindware.hashnode.dev';
  const query = `
    query PostBySlug($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          id
          title
          brief
          slug
          publishedAt
          coverImage { url }
          author { name }
          tags { name slug }
          content { markdown html }
          readTimeInMinutes
        }
      }
    }
  `;

  const res = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { host, slug } }),
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return data?.data?.publication?.post ?? null;
}

/**
 * Fetch posts: Strapi → local markdown → Hashnode (tertiary so the site never blanks).
 */
export async function fetchPosts(
  first: number = 10,
  _after?: string,
): Promise<UnifiedPost[]> {
  try {
    const fromStrapiOrLocal = await resolveBlogPosts(first);
    if (fromStrapiOrLocal.length > 0) return fromStrapiOrLocal;
  } catch (error) {
    console.warn(
      '[Content API] Strapi/local posts failed:',
      error instanceof Error ? error.message : error,
    );
  }

  try {
    return await fetchHashnodePosts(first);
  } catch (error) {
    console.warn(
      '[Content API] Hashnode posts failed:',
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function fetchPostBySlug(
  slug: string,
): Promise<UnifiedPost | null> {
  try {
    const post = await resolveBlogPostBySlug(slug);
    if (post) return post;
  } catch (error) {
    console.warn(
      `[Content API] Strapi/local post ${slug} failed:`,
      error instanceof Error ? error.message : error,
    );
  }

  try {
    return await fetchHashnodePostBySlug(slug);
  } catch (error) {
    console.warn(
      `[Content API] Hashnode post ${slug} failed:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function fetchPublication(): Promise<UnifiedPublication | null> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://johnschibelli.dev';
  let total = 0;
  try {
    total = (await resolveBlogSlugs()).length;
  } catch {
    total = getLocalBlogSlugs().length;
  }

  return {
    id: 'personal-publication',
    title: 'John Schibelli',
    description: 'Engineering notes, case studies, and product development.',
    url: siteUrl,
    favicon: '',
    logo: '',
    isTeam: false,
    preferences: {
      logo: '',
      darkMode: { logo: '' },
      navbarItems: [],
      layout: {
        navbarStyle: 'default',
        footerStyle: 'default',
        showBranding: true,
      },
      members: [],
    },
    displayTitle: 'John Schibelli',
    descriptionSEO: 'Engineering notes, case studies, and product development.',
    posts: { totalDocuments: total },
    author: { name: 'John Schibelli', profilePicture: null },
    followersCount: 0,
    ogMetaData: { image: null },
  };
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const slugs = await resolveBlogSlugs();
    if (slugs.length > 0) return slugs;
  } catch {
    // continue
  }

  try {
    const posts = await fetchHashnodePosts(100);
    if (posts.length > 0) return posts.map((p) => p.slug);
  } catch {
    // continue
  }

  return getLocalBlogSlugs();
}
