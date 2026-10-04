import { prisma, DEFAULT_USER_ID, ensureDefaultUser } from '../config/prisma.js';
import { TaskService } from './task.service.js';

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'COMPLETED';
}

export interface ScheduleTodoInput {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string | null;
}

export class TodoService {
  static async getTodos(filters?: { status?: string }) {
    await ensureDefaultUser();

    const where: any = { userId: DEFAULT_USER_ID };
    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.todo.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // TODO first, then COMPLETED
        { createdAt: 'desc' },
      ],
    });
  }

  static async getTodoById(id: string) {
    return prisma.todo.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
  }

  static async createTodo(data: CreateTodoInput) {
    await ensureDefaultUser();

    return prisma.todo.create({
      data: {
        userId: DEFAULT_USER_ID,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority || 'MEDIUM',
        status: 'TODO',
      },
    });
  }

  static async updateTodo(id: string, data: UpdateTodoInput) {
    await ensureDefaultUser();

    const existing = await prisma.todo.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Todo not found');
    }

    let completedAt = existing.completedAt;
    if (data.status) {
      if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        completedAt = new Date();
      } else if (data.status === 'TODO') {
        completedAt = null;
      }
    }

    return prisma.todo.update({
      where: { id },
      data: {
        ...data,
        completedAt,
      },
    });
  }

  static async deleteTodo(id: string) {
    const existing = await prisma.todo.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Todo not found');
    }

    await prisma.todo.delete({
      where: { id },
    });

    return { success: true };
  }

  static async completeTodo(id: string) {
    const existing = await prisma.todo.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Todo not found');
    }

    const nextStatus = existing.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    const completedAt = nextStatus === 'COMPLETED' ? new Date() : null;

    return prisma.todo.update({
      where: { id },
      data: {
        status: nextStatus,
        completedAt,
      },
    });
  }

  static async scheduleTodo(id: string, scheduleData: ScheduleTodoInput) {
    const existing = await prisma.todo.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Todo not found');
    }

    // 1. Create ScheduledTask
    const taskResult = await TaskService.createTask({
      title: existing.title,
      description: existing.description,
      date: scheduleData.date,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      priority: scheduleData.priority || (existing.priority as any) || 'MEDIUM',
      category: scheduleData.category,
      status: 'TODO',
    });

    // 2. Mark the to-do as completed since it has been scheduled into the calendar
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      scheduledTask: taskResult.task,
      todo: updatedTodo,
      syncError: taskResult.syncError,
    };
  }
}
