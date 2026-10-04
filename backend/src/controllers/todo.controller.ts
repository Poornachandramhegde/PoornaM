import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TodoService } from '../services/todo.service.js';

const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'COMPLETED']).optional(),
});

const scheduleTodoSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:mm'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.string().optional().nullable(),
});

export class TodoController {
  static async getTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const todos = await TodoService.getTodos({
        status: typeof status === 'string' ? status : undefined,
      });
      res.json({ success: true, data: todos });
    } catch (error) {
      next(error);
    }
  }

  static async getTodoById(req: Request, res: Response, next: NextFunction) {
    try {
      const todo = await TodoService.getTodoById(req.params.id);
      if (!todo) {
        return res.status(404).json({ success: false, error: 'Todo not found' });
      }
      res.json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  static async createTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTodoSchema.parse(req.body);
      const todo = await TodoService.createTodo(validated);
      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  static async updateTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateTodoSchema.parse(req.body);
      const todo = await TodoService.updateTodo(req.params.id, validated);
      res.json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTodo(req: Request, res: Response, next: NextFunction) {
    try {
      await TodoService.deleteTodo(req.params.id);
      res.json({ success: true, message: 'Todo deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async completeTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const todo = await TodoService.completeTodo(req.params.id);
      res.json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  static async scheduleTodo(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = scheduleTodoSchema.parse(req.body);
      const result = await TodoService.scheduleTodo(req.params.id, validated);
      res.json({
        success: true,
        data: result,
        syncWarning: result.syncError,
      });
    } catch (error) {
      next(error);
    }
  }
}
