import { PrismaClient } from '@prisma/client';

declare global {
  var __smrWorkerPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__smrWorkerPrisma ??
  new PrismaClient({ log: ['warn', 'error'] });

if (process.env.NODE_ENV !== 'production') {
  global.__smrWorkerPrisma = prisma;
}
