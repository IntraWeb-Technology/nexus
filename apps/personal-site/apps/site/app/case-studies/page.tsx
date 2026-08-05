import { Metadata } from 'next';
import { Container } from '../../components/shared/container';
import { Layout } from '../../components/shared/layout';
import { AppProvider } from '../../components/contexts/appContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Chatbot from '../../components/features/chatbot/Chatbot';
import { resolveCaseStudies } from '../../lib/strapi-content';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Case Studies | John Schibelli Portfolio',
  description:
    'Explore detailed case studies showcasing successful projects, strategic analysis, and implementation results.',
  keywords: [
    'case studies',
    'portfolio',
    'projects',
    'strategic analysis',
    'implementation',
  ],
};

export default async function CaseStudiesPage() {
  // Strapi → MDX under content/case-studies
  const caseStudies = await resolveCaseStudies();

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
          <Container className="py-12">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Case Studies
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-stone-600 dark:text-stone-400">
                Deep dives into strategy, architecture, and delivery outcomes.
              </p>
            </div>

            {caseStudies.length === 0 ? (
              <p className="text-center text-stone-600 dark:text-stone-400">
                Case studies will appear here once published. Local MDX lives in{' '}
                <code className="text-sm">content/case-studies</code>; sync
                missing files from portfolio-os if needed.
              </p>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {caseStudies.map((study) => {
                  const { meta } = study;
                  return (
                    <Card key={meta.slug} className="flex flex-col overflow-hidden">
                      {meta.coverImage && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={meta.coverImage}
                            alt={meta.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                          {meta.publishedAt && (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(meta.publishedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                          <User className="ml-2 h-4 w-4" />
                          <span>{meta.author?.name || 'John Schibelli'}</span>
                        </div>
                        <CardTitle className="line-clamp-2">{meta.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {meta.excerpt || meta.seoDescription}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        {meta.tags && meta.tags.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {meta.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Button asChild className="w-full">
                          <Link href={`/case-studies/${meta.slug}`}>
                            Read case study
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </Container>
          <Chatbot />
        </main>
      </Layout>
    </AppProvider>
  );
}
