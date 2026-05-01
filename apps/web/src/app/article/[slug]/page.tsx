import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { JSX } from 'react';
import { CATEGORY_LABELS, type ArticleDetail } from '@smr/types';
import { extractToc, formatReadingTime } from '@smr/content';
import { getArticleBySlug } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ArticleBody } from '@/components/ArticleBody';
import { FontSizeToggle } from '@/components/FontSizeToggle';
import { getFeedArticles } from '@/lib/feeds';

export const revalidate = 300;
export async function generateStaticParams() {
  const articles: ArticleDetail[] = await getFeedArticles();
  return articles.map((a: ArticleDetail) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticleBySlug(slug);
    return {
      title: article.title,
      description: article.summary,
      openGraph: {
        title: article.title,
        description: article.summary,
        type: 'article',
        publishedTime: article.publishedAt,
      },
    };
  } catch {
    return { title: 'Article' };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }
  if (!article) notFound();

  const toc = extractToc(article.bodyMarkdown).filter((t) => t.level === 2);
  const date = new Date(article.publishedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="page">
      <SiteHeader />
      <article id="reader" className="reader font-md">
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {CATEGORY_LABELS[article.category]} · {date} · {formatReadingTime(article.readingTimeSec)}
        </p>
        <h1>{article.title}</h1>
        <p className="article-meta">{article.summary}</p>

        <div className="controls" aria-label="Reader controls">
          <FontSizeToggle targetId="reader" />
          <a href="#sources">Sources ↓</a>
        </div>

        {toc.length > 1 && (
          <nav className="toc" aria-label="Table of contents">
            <h2>In this piece</h2>
            <ol>
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <ArticleBody markdown={article.bodyMarkdown} />

        <section id="sources" className="sources">
          <h2>Sources</h2>
          {article.sources.length === 0 ? (
            <p>(No external sources cited.)</p>
          ) : (
            <ol>
              {article.sources.map((s) => (
                <li key={s.id}>
                  <a href={s.url} rel="noopener noreferrer" target="_blank">
                    {s.title}
                  </a>
                  {s.author ? <span className="author"> — {s.author}</span> : null}
                  {s.publishedAt ? (
                    <span className="author">
                      {' '}
                      ({new Date(s.publishedAt).toLocaleDateString()})
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
