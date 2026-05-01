import { PrismaClient } from '@prisma/client';
import { dailySlug, readingTimeSeconds } from '@smr/content';

const prisma = new PrismaClient();

const SAMPLE_ARTICLES = [
  {
    category: 'til' as const,
    title: 'Why Slow Reading Is Making a Comeback',
    summary:
      'For decades, news has been engineered to feel urgent. A growing reader movement is rebuilding the long, lamp-lit habit of reading one article at a time.',
    body: `## A return to attention

The digital "feed" was a clever invention. Tap, scroll, and the world arrives sliced into chunks small enough to skim through in the queue at a coffee shop. It was efficient. It was also exhausting.

Slow reading is the deliberate counter-move. Read one piece. Read it well. Take notes if you like. Close the tab.

## What it changes

When the medium does not chase you for engagement, the contents change. Pieces can be longer. Quieter. They can ask questions and let the answers wait. The reader, in turn, brings something rare back to the page: their full attention.

## How to start

- Pick a single article each evening.
- Set a 12-minute timer. (You will not need it.)
- Make notes by hand if you have a notebook nearby.
- Resist sharing it until tomorrow.

You are reading this on a platform built around exactly this practice. There is no infinite scroll below this paragraph. There is, however, tomorrow.`,
    sources: [
      {
        kind: 'WIKI' as const,
        url: 'https://en.wikipedia.org/wiki/Slow_reading',
        title: 'Slow reading',
        author: 'Wikipedia contributors',
      },
    ],
  },
  {
    category: 'tech' as const,
    title: 'Local-First Software, Quietly Winning',
    summary:
      'A short tour through the renewed interest in apps that store your data on your device, sync when they can, and never pretend the network is essential.',
    body: `## The premise

A "local-first" app stores your data on your device first. Sync, when it happens, is a bonus and not a prerequisite. Files travel with you. Edits work on planes.

## Why now

Battery life is good. Local databases are excellent. Conflict-free replicated data types (CRDTs) finally have practical implementations. And users — quietly — have noticed that the web is sometimes slow.

## Trade-offs to read about

- Sync conflicts are easier than they used to be, but not free.
- End-to-end encryption is a different problem and shouldn't be conflated.
- Discoverability still favors the web.

## A reading list

Open one of the source links below. Resist the urge to open all four.`,
    sources: [
      {
        kind: 'RSS' as const,
        url: 'https://www.inkandswitch.com/local-first/',
        title: 'Local-first software',
        author: 'Ink & Switch',
      },
    ],
  },
  {
    category: 'diy' as const,
    title: 'A Lamp That Reads Better Than a Phone',
    summary:
      'A simple, weekend-shop tutorial on building a low-glare reading lamp from a thrift-store base, a 2700K bulb, and ten dollars of warm-tone diffusion film.',
    body: `## Why warm light matters

Cooler color temperatures (5000K and up) are great for kitchens. They are not great for reading at 10 pm. A 2700K bulb plus a paper-tone shade gets you a soft, steady pool of light that doesn't fight your circadian rhythm.

## Bill of materials

- One thrift-store lamp base ($6).
- One 2700K LED bulb, 60W equivalent ($4).
- One sheet warm-tone diffusion film ($3).
- Optional: a fabric shade if the original is yellowed.

## Steps

1. Replace the bulb. Stop here if the lamp is already pleasant.
2. Tape the diffusion film to the inside of the shade.
3. Read for an hour and decide if step 2 helped.

That's it. The world's least Pinterest-y DIY post — but you'll feel the difference tonight.`,
    sources: [
      {
        kind: 'RSS' as const,
        url: 'https://makezine.com/projects/',
        title: 'Make: Projects',
        author: 'Make:',
      },
    ],
  },
  {
    category: 'news' as const,
    title: 'A Quieter News Diet — How to Build One',
    summary:
      'You do not have to read every headline. A short essay on choosing two or three sources, reading them once a day, and reclaiming an hour of your life.',
    body: `## The case for less

The most useful news in a given week is roughly the same across outlets. Reading more sources does not, on average, give you a meaningfully more accurate worldview. It does take more of your day.

## A starter diet

- One world-news source (a wire or a public broadcaster).
- One in-depth weekly (long pieces, slower clock).
- One independent voice in a topic you care about (climate, housing, science).

Read each once. Stop.

## What to skip

Push notifications. Breaking-news banners. Anything optimized to interrupt you. None of these things make you better informed.`,
    sources: [
      {
        kind: 'RSS' as const,
        url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
        title: 'BBC World News',
        author: 'BBC',
      },
    ],
  },
];

async function main() {
  const tags = [
    { slug: 'reading', name: 'Reading' },
    { slug: 'attention', name: 'Attention' },
    { slug: 'local-first', name: 'Local-first' },
    { slug: 'lighting', name: 'Lighting' },
    { slug: 'media-diet', name: 'Media diet' },
  ];
  for (const t of tags) {
    await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t });
  }

  const today = new Date().toISOString();

  for (const a of SAMPLE_ARTICLES) {
    const slug = dailySlug(a.category, today, a.title);
    const article = await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: a.title,
        summary: a.summary,
        bodyMarkdown: a.body,
        category: a.category,
        kind: 'FEATURE',
        status: 'PUBLISHED',
        readingTimeSec: readingTimeSeconds(a.body),
      },
    });

    let position = 0;
    for (const s of a.sources) {
      const { urlHash } = await import('@smr/content');
      const hash = urlHash(s.url);
      const source = await prisma.source.upsert({
        where: { urlHash: hash },
        update: {},
        create: {
          kind: s.kind,
          externalId: hash,
          url: s.url,
          urlHash: hash,
          title: s.title,
          author: s.author,
          category: a.category,
          payload: { seeded: true },
        },
      });
      await prisma.articleSource.upsert({
        where: { articleId_sourceId: { articleId: article.id, sourceId: source.id } },
        update: { position },
        create: { articleId: article.id, sourceId: source.id, position },
      });
      position += 1;
    }
  }

  console.log(`Seed complete: ${SAMPLE_ARTICLES.length} articles, ${tags.length} tags.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
