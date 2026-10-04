import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/task.service.js';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:mm'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, startDate, endDate, status } = req.query;
      const tasks = await TaskService.getTasks({
        date: typeof date === 'string' ? date : undefined,
        startDate: typeof startDate === 'string' ? startDate : undefined,
        endDate: typeof endDate === 'string' ? endDate : undefined,
        status: typeof status === 'string' ? status : undefined,
      });
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTaskSchema.parse(req.body);
      const result = await TaskService.createTask(validated);
      res.status(201).json({
        success: true,
        data: result.task,
        syncWarning: result.syncError,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateTaskSchema.parse(req.body);
      const result = await TaskService.updateTask(req.params.id, validated);
      res.json({
        success: true,
        data: result.task,
        syncWarning: result.syncError,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      await TaskService.deleteTask(req.params.id);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async completeTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.completeTask(req.params.id);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
}
