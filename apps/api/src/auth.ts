import { timingSafeEqual } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from './env';

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization ?? '';
  const expected = env.adminToken;
  if (!expected) {
    reply.code(503).send({ error: 'Admin token not configured on server.' });
    return;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    reply.code(401).send({ error: 'Missing bearer token.' });
    return;
  }
  const provided = match[1] ?? '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    reply.code(401).send({ error: 'Invalid token.' });
    return;
  }
}
