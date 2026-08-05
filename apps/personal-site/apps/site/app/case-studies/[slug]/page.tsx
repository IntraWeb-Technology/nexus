import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '../../../components/shared/container';
import { Layout } from '../../../components/shared/layout';
import { AppProvider } from '../../../components/contexts/appContext';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import Link from 'next/link';
import { CaseStudyMarkdown } from '../../../components/features/case-studies/case-study-markdown';
import {
  resolveCaseStudies,
  resolveCaseStudyBySlug,
} from '../../../lib/strapi-content';
import Chatbot from '../../../components/features/chatbot/Chatbot';

export const revalidate = 60;

interface CaseStudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudyData = await resolveCaseStudyBySlug(slug);

  if (!caseStudyData) {
    return { title: 'Case Study Not Found' };
  }

  const { meta } = caseStudyData;
  const title = `${meta.title} | John Schibelli Portfolio`;
  const description =
    meta.excerpt || meta.seoDescription || 'Case study showcasing development work';
  const canonical = `https://johnschibelli.dev/case-studies/${slug}`;

  return {
    metadataBase: new URL('https://johnschibelli.dev'),
    title,
    description,
    keywords: meta.tags || [],
    authors: [{ name: meta.author?.name || 'John Schibelli' }],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: canonical,
      title: meta.seoTitle || title,
      description,
      siteName: 'John Schibelli Portfolio',
      images: meta.coverImage
        ? [{ url: meta.coverImage, width: 1200, height: 630, alt: meta.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.seoTitle || title,
      description,
      images: meta.coverImage ? [meta.coverImage] : [],
    },
    alternates: { canonical },
  };
}

export async function generateStaticParams() {
  const studies = await resolveCaseStudies();
  return studies.map((study) => ({ slug: study.meta.slug }));
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudyData = await resolveCaseStudyBySlug(slug);

  if (!caseStudyData) {
    notFound();
  }

  const { meta, content } = caseStudyData;

  return (
    <AppProvider
      publication={{
        title: 'John Schibelli',
        displayTitle: 'John Schibelli',
        descriptionSEO: 'Senior Front-End Developer with 15+ years of experience',
        url: 'https://johnschibelli.dev',
        author: { name: 'John Schibelli' },
        preferences: { logo: null as unknown as string },
      }}
    >
      <Layout>
        <main className="min-h-screen bg-background">
          <Container className="mx-auto max-w-4xl py-8">
            <article>
              <div className="mb-8">
                <Button variant="ghost" asChild>
                  <Link href="/case-studies" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Case Studies
                  </Link>
                </Button>
              </div>

              <div className="mb-12">
                <div className="mb-4 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {meta.publishedAt
                      ? new Date(meta.publishedAt).toLocaleDateString()
                      : 'Not published'}
                  </span>
                  <User className="ml-4 h-4 w-4" />
                  <span>{meta.author?.name || 'John Schibelli'}</span>
                </div>

                <h1 className="mb-6 text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {meta.title}
                </h1>

                <p className="mb-8 text-xl text-stone-600 dark:text-stone-400">
                  {meta.excerpt || meta.seoDescription}
                </p>

                {meta.tags && meta.tags.length > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {meta.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <CaseStudyMarkdown contentMarkdown={content} />
              </div>

              <Card className="mt-12">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
                      Interested in working together?
                    </h3>
                    <p className="mb-4 text-stone-600 dark:text-stone-400">
                      Let&apos;s discuss how we can create something amazing for
                      your business.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button asChild>
                        <Link href="/contact">Get in Touch</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/projects">View More Projects</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>
          </Container>
          <Chatbot />
        </main>
      </Layout>
    </AppProvider>
  );
}
