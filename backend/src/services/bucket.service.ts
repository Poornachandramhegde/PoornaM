import { prisma, DEFAULT_USER_ID, ensureDefaultUser } from '../config/prisma.js';

export interface CreateBucketItemInput {
  title: string;
  description?: string | null;
  category?: string | null;
  targetDate?: string | null;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface UpdateBucketItemInput {
  title?: string;
  description?: string | null;
  category?: string | null;
  targetDate?: string | null;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export class BucketService {
  static async getItems(filters?: { status?: string }) {
    await ensureDefaultUser();

    const where: any = { userId: DEFAULT_USER_ID };
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.bucketItem.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
  }

  static async getItemById(id: string) {
    return prisma.bucketItem.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
  }

  static async createItem(data: CreateBucketItemInput) {
    await ensureDefaultUser();

    return prisma.bucketItem.create({
      data: {
        userId: DEFAULT_USER_ID,
        title: data.title,
        description: data.description,
        category: data.category,
        targetDate: data.targetDate,
        status: data.status || 'PLANNED',
      },
    });
  }

  static async updateItem(id: string, data: UpdateBucketItemInput) {
    await ensureDefaultUser();

    const existing = await prisma.bucketItem.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Bucket item not found');
    }

    let completedAt = existing.completedAt;
    if (data.status) {
      if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        completedAt = new Date();
      } else if (data.status !== 'COMPLETED') {
        completedAt = null;
      }
    }

    return prisma.bucketItem.update({
      where: { id },
      data: {
        ...data,
        completedAt,
      },
    });
  }

  static async deleteItem(id: string) {
    const existing = await prisma.bucketItem.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Bucket item not found');
    }

    await prisma.bucketItem.delete({
      where: { id },
    });

    return { success: true };
  }

  static async updateStatus(id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') {
    const existing = await prisma.bucketItem.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Bucket item not found');
    }

    const completedAt = status === 'COMPLETED' ? new Date() : null;

    return prisma.bucketItem.update({
      where: { id },
      data: {
        status,
        completedAt,
      },
    });
  }
}
