import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('⚠️ DATABASE_URL belum diatur di .env. Pastikan konfigurasi database sudah benar.');
  }

  const adapter = new PrismaPg({
    connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/supermalazz',
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
