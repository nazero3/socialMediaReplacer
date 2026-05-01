import type { FastifyInstance } from 'fastify';
import { isCategory } from '@smr/types';
import { prisma } from '../db.js';
import { toArticleDetail, toArticleSummary } from '../serializers.js';

export async function articlesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/articles', async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const page = Math.max(1, Number(q.page ?? '1'));
    const limit = Math.min(50, Math.max(1, Number(q.limit ?? '20')));
    const category = q.category && isCategory(q.category) ? q.category : undefined;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED', ...(category ? { category } : {}) },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.article.count({
        where: { status: 'PUBLISHED', ...(category ? { category } : {}) },
      }),
    ]);

    reply.header('Cache-Control', 'public, max-age=60, s-maxage=300');
    return { items: items.map(toArticleSummary), page, limit, total };
  });

  app.get('/articles/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        sources: { include: { source: true } },
        tags: { include: { tag: true } },
      },
    });
    if (!article || article.status !== 'PUBLISHED') {
      reply.code(404);
      return { error: 'Not found' };
    }
    reply.header('Cache-Control', 'public, max-age=60, s-maxage=600');
    return toArticleDetail(article);
  });

  app.get('/categories/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    if (!isCategory(slug)) {
      reply.code(404);
      return { error: 'Unknown category' };
    }
    const items = await prisma.article.findMany({
      where: { status: 'PUBLISHED', category: slug },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    reply.header('Cache-Control', 'public, max-age=60, s-maxage=300');
    return { items: items.map(toArticleSummary), category: slug };
  });

  app.get('/search', async (req) => {
    const q = (req.query as { q?: string }).q?.trim() ?? '';
    if (q.length < 2) return { items: [], q };
    const items = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    });
    return { items: items.map(toArticleSummary), q };
  });
}
