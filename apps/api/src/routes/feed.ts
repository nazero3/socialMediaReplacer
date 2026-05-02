import type { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { env } from '../env';
import { renderAtomFeed } from '../feed';
import { toArticleSummary } from '../serializers';

export async function feedRoutes(app: FastifyInstance): Promise<void> {
  app.get('/feed.xml', async (_req, reply) => {
    const items = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    const xml = renderAtomFeed(items.map(toArticleSummary), {
      siteUrl: env.siteUrl,
      selfUrl: `${env.publicUrl}/feed.xml`,
      title: 'socialMediaReplacer',
      subtitle: 'A reader-first daily digest. No infinite scroll.',
    });
    reply
      .type('application/atom+xml; charset=utf-8')
      .header('Cache-Control', 'public, max-age=600, s-maxage=600')
      .send(xml);
  });
}
