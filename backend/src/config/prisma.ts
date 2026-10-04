import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const DEFAULT_USER_ID = 'default-poornam-user';

export async function ensureDefaultUser() {
  const existing = await prisma.user.findFirst({
    where: { id: DEFAULT_USER_ID },
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: 'PoornaM User',
        email: 'user@poornam.local',
      },
    });
  }

  return existing;
}
