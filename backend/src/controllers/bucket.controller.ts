import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BucketService } from '../services/bucket.service.js';

const createBucketItemSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

const updateBucketItemSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']),
});

export class BucketController {
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const items = await BucketService.getItems({
        status: typeof status === 'string' ? status : undefined,
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  static async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await BucketService.getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Bucket item not found' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createBucketItemSchema.parse(req.body);
      const item = await BucketService.createItem(validated);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateBucketItemSchema.parse(req.body);
      const item = await BucketService.updateItem(req.params.id, validated);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      await BucketService.deleteItem(req.params.id);
      res.json({ success: true, message: 'Bucket item deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateStatusSchema.parse(req.body);
      const item = await BucketService.updateStatus(req.params.id, validated.status);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }
}
