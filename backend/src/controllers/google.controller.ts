import { Request, Response, NextFunction } from 'express';
import { GoogleCalendarService } from '../services/google-calendar.service.js';
import { ENV } from '../config/env.js';

export class GoogleController {
  static async getAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const url = GoogleCalendarService.getAuthUrl();
      if (req.query.format === 'json') {
        return res.json({ success: true, url });
      }
      return res.redirect(url);
    } catch (error) {
      next(error);
    }
  }

  static async handleCallback(req: Request, res: Response, _next: NextFunction) {
    const { code, error } = req.query;

    if (error || !code || typeof code !== 'string') {
      const errorMsg = encodeURIComponent((error as string) || 'Missing authorization code');
      return res.redirect(`${ENV.FRONTEND_URL}/settings?google_error=${errorMsg}`);
    }

    try {
      await GoogleCalendarService.handleCallback(code);
      return res.redirect(`${ENV.FRONTEND_URL}/settings?google=connected`);
    } catch (err: any) {
      console.error('[GoogleController.handleCallback] Error during token exchange:', err);
      const errorMsg = encodeURIComponent(err?.message || 'Failed to authenticate with Google');
      return res.redirect(`${ENV.FRONTEND_URL}/settings?google_error=${errorMsg}`);
    }
  }

  static async getStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = await GoogleCalendarService.getStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  static async disconnect(_req: Request, res: Response, next: NextFunction) {
    try {
      await GoogleCalendarService.disconnect();
      res.json({ success: true, message: 'Google Calendar disconnected successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeMin, timeMax } = req.query;
      const events = await GoogleCalendarService.fetchEvents(
        undefined as any,
        typeof timeMin === 'string' ? timeMin : undefined,
        typeof timeMax === 'string' ? timeMax : undefined
      );
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }
}
