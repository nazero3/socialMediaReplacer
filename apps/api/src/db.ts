import { PrismaClient } from '@prisma/client';

declare global {
  var __smrPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__smrPrisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__smrPrisma = prisma;
}
