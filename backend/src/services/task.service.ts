import { prisma, DEFAULT_USER_ID, ensureDefaultUser } from '../config/prisma.js';
import { GoogleCalendarService } from './google-calendar.service.js';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  date?: string;
  startTime?: string;
  endTime?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string | null;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export class TaskService {
  static async getTasks(filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    await ensureDefaultUser();

    const where: any = { userId: DEFAULT_USER_ID };

    if (filters?.date) {
      where.date = filters.date;
    } else if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.scheduledTask.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  static async getTaskById(id: string) {
    return prisma.scheduledTask.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });
  }

  static async createTask(data: CreateTaskInput) {
    await ensureDefaultUser();

    // End time must be after start time
    if (data.startTime >= data.endTime) {
      throw new Error('End time must be after start time');
    }

    // 1. Create in SQLite first
    let task = await prisma.scheduledTask.create({
      data: {
        userId: DEFAULT_USER_ID,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        priority: data.priority || 'MEDIUM',
        category: data.category,
        status: data.status || 'TODO',
      },
    });

    // 2. Try Google Calendar sync
    let syncError: string | null = null;
    try {
      const googleEventId = await GoogleCalendarService.createEvent(
        DEFAULT_USER_ID,
        {
          title: task.title,
          description: task.description,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
        }
      );

      if (googleEventId) {
        task = await prisma.scheduledTask.update({
          where: { id: task.id },
          data: { googleEventId },
        });
      }
    } catch (err: any) {
      syncError = err?.message || 'Google Calendar sync failed';
      console.warn('[TaskService.createTask] Calendar sync warning:', syncError);
    }

    return {
      task,
      syncError,
    };
  }

  static async updateTask(id: string, data: UpdateTaskInput) {
    await ensureDefaultUser();

    const existing = await prisma.scheduledTask.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Task not found');
    }

    const newStartTime = data.startTime ?? existing.startTime;
    const newEndTime = data.endTime ?? existing.endTime;

    if (newStartTime >= newEndTime) {
      throw new Error('End time must be after start time');
    }

    let completedAt = existing.completedAt;
    if (data.status) {
      if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        completedAt = new Date();
      } else if (data.status !== 'COMPLETED') {
        completedAt = null;
      }
    }

    // Update in database
    let updatedTask = await prisma.scheduledTask.update({
      where: { id },
      data: {
        ...data,
        completedAt,
      },
    });

    // Update in Google Calendar if synced
    let syncError: string | null = null;
    try {
      if (existing.googleEventId) {
        await GoogleCalendarService.updateEvent(
          DEFAULT_USER_ID,
          existing.googleEventId,
          {
            title: updatedTask.title,
            description: updatedTask.description,
            date: updatedTask.date,
            startTime: updatedTask.startTime,
            endTime: updatedTask.endTime,
          }
        );
      } else {
        // Try linking if user just connected calendar
        const googleEventId = await GoogleCalendarService.createEvent(
          DEFAULT_USER_ID,
          {
            title: updatedTask.title,
            description: updatedTask.description,
            date: updatedTask.date,
            startTime: updatedTask.startTime,
            endTime: updatedTask.endTime,
          }
        );
        if (googleEventId) {
          updatedTask = await prisma.scheduledTask.update({
            where: { id: updatedTask.id },
            data: { googleEventId },
          });
        }
      }
    } catch (err: any) {
      syncError = err?.message || 'Failed to update Google Calendar event';
      console.warn('[TaskService.updateTask] Calendar sync warning:', syncError);
    }

    return {
      task: updatedTask,
      syncError,
    };
  }

  static async deleteTask(id: string) {
    const existing = await prisma.scheduledTask.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Task not found');
    }

    // Try deleting from Google Calendar if event exists
    if (existing.googleEventId) {
      try {
        await GoogleCalendarService.deleteEvent(
          DEFAULT_USER_ID,
          existing.googleEventId
        );
      } catch (err) {
        console.warn('[TaskService.deleteTask] Calendar delete warning:', err);
      }
    }

    await prisma.scheduledTask.delete({
      where: { id },
    });

    return { success: true };
  }

  static async completeTask(id: string) {
    const existing = await prisma.scheduledTask.findFirst({
      where: { id, userId: DEFAULT_USER_ID },
    });

    if (!existing) {
      throw new Error('Task not found');
    }

    const nextStatus = existing.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    const completedAt = nextStatus === 'COMPLETED' ? new Date() : null;

    const task = await prisma.scheduledTask.update({
      where: { id },
      data: {
        status: nextStatus,
        completedAt,
      },
    });

    return task;
  }
}
