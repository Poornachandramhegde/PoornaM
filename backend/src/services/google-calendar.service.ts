import { google } from 'googleapis';
import { prisma, DEFAULT_USER_ID } from '../config/prisma.js';
import { ENV } from '../config/env.js';

// Format RFC3339 date time string explicitly in Asia/Kolkata (+05:30)
function formatRfc3339InIST(date: string, time: string): string {
  const formattedTime = time.length === 5 ? `${time}:00` : time;
  // Asia/Kolkata is fixed at UTC+05:30 (no daylight savings time)
  return `${date}T${formattedTime}+05:30`;
}

// Format Date object to YYYY-MM-DD and HH:mm in Asia/Kolkata
function parseGoogleDateTimeInIST(dateTimeStr: string): { date: string; time: string } {
  const d = new Date(dateTimeStr);
  const formatterDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: ENV.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formatterTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: ENV.TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return {
    date: formatterDate.format(d),
    time: formatterTime.format(d),
  };
}

export class GoogleCalendarService {
  private static createOAuthClient() {
    return new google.auth.OAuth2(
      ENV.GOOGLE_CLIENT_ID,
      ENV.GOOGLE_CLIENT_SECRET,
      ENV.GOOGLE_REDIRECT_URI
    );
  }

  static getAuthUrl(): string {
    if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google OAuth credentials not configured in backend .env. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
      );
    }

    const oauth2Client = this.createOAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
  }

  static async handleCallback(code: string, userId: string = DEFAULT_USER_ID) {
    const oauth2Client = this.createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || 'user@poornam.local';
    const googleId = userInfo.data.id || null;
    const name = userInfo.data.name || 'PoornaM User';

    // Update user info
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        name,
        email,
        googleId: googleId ?? undefined,
      },
      create: {
        id: userId,
        name,
        email,
        googleId,
      },
    });

    // Upsert GoogleCalendarConnection with refresh token persistence
    await prisma.googleCalendarConnection.upsert({
      where: { userId },
      update: {
        googleAccountId: googleId,
        calendarId: 'primary',
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || undefined, // keep existing refresh token if not in response
        tokenExpiry: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
      },
      create: {
        userId,
        googleAccountId: googleId,
        calendarId: 'primary',
        accessToken: tokens.access_token || null,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
      },
    });

    return { email, name };
  }

  static async getAuthenticatedClient(userId: string = DEFAULT_USER_ID) {
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { userId },
    });

    if (!connection || (!connection.accessToken && !connection.refreshToken)) {
      return null;
    }

    const oauth2Client = this.createOAuthClient();
    oauth2Client.setCredentials({
      access_token: connection.accessToken || undefined,
      refresh_token: connection.refreshToken || undefined,
      expiry_date: connection.tokenExpiry ? Number(connection.tokenExpiry) : undefined,
    });

    // Check if access token is expired or expiring within 2 minutes
    const now = Date.now();
    const expiry = connection.tokenExpiry ? Number(connection.tokenExpiry) : 0;
    const isExpired = !connection.accessToken || (expiry > 0 && expiry <= now + 120000);

    if (isExpired && connection.refreshToken) {
      try {
        console.log('[GoogleCalendarService] Access token expired or expiring soon, automatically refreshing with refresh_token...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        await prisma.googleCalendarConnection.update({
          where: { userId },
          data: {
            accessToken: credentials.access_token || undefined,
            refreshToken: credentials.refresh_token || connection.refreshToken,
            tokenExpiry: credentials.expiry_date ? BigInt(credentials.expiry_date) : undefined,
          },
        });
        console.log('[GoogleCalendarService] Access token refreshed and persisted to database.');
      } catch (refreshErr: any) {
        console.error('[GoogleCalendarService] Automatic token refresh error:', refreshErr?.message);
        if (refreshErr?.message?.includes('invalid_grant')) {
          console.warn('[GoogleCalendarService] Refresh token invalid or revoked by Google. Removing connection.');
          await prisma.googleCalendarConnection.deleteMany({ where: { userId } });
          return null;
        }
      }
    }

    // Automatically persist any tokens emitted during API calls
    oauth2Client.on('tokens', async (newTokens) => {
      try {
        await prisma.googleCalendarConnection.update({
          where: { userId },
          data: {
            accessToken: newTokens.access_token || undefined,
            refreshToken: newTokens.refresh_token || undefined,
            tokenExpiry: newTokens.expiry_date ? BigInt(newTokens.expiry_date) : undefined,
          },
        });
      } catch (err) {
        console.error('[GoogleCalendarService] Failed to persist refreshed token from listener:', err);
      }
    });

    return { oauth2Client, calendarId: connection.calendarId || 'primary' };
  }

  static async getStatus(userId: string = DEFAULT_USER_ID) {
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!connection || (!connection.accessToken && !connection.refreshToken)) {
      return { connected: false, email: null, calendarId: null };
    }

    return {
      connected: true,
      email: connection.user?.email || null,
      calendarId: connection.calendarId || 'primary',
    };
  }

  static async disconnect(userId: string = DEFAULT_USER_ID) {
    await prisma.googleCalendarConnection.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  static async createEvent(
    userId: string,
    task: {
      title: string;
      description?: string | null;
      date: string; // YYYY-MM-DD
      startTime: string; // HH:mm
      endTime: string; // HH:mm
    }
  ): Promise<string | null> {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      if (!auth) return null;

      const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client });

      const startRfc3339 = formatRfc3339InIST(task.date, task.startTime);
      const endRfc3339 = formatRfc3339InIST(task.date, task.endTime);

      const response = await calendar.events.insert({
        calendarId: auth.calendarId,
        requestBody: {
          summary: task.title,
          description: task.description || undefined,
          start: {
            dateTime: startRfc3339,
            timeZone: ENV.TIMEZONE,
          },
          end: {
            dateTime: endRfc3339,
            timeZone: ENV.TIMEZONE,
          },
        },
      });

      return response.data.id || null;
    } catch (error) {
      console.error('[GoogleCalendarService.createEvent] Failed to create event:', error);
      return null;
    }
  }

  static async updateEvent(
    userId: string,
    eventId: string,
    task: {
      title: string;
      description?: string | null;
      date: string;
      startTime: string;
      endTime: string;
    }
  ): Promise<boolean> {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      if (!auth) return false;

      const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client });

      const startRfc3339 = formatRfc3339InIST(task.date, task.startTime);
      const endRfc3339 = formatRfc3339InIST(task.date, task.endTime);

      await calendar.events.patch({
        calendarId: auth.calendarId,
        eventId,
        requestBody: {
          summary: task.title,
          description: task.description || undefined,
          start: {
            dateTime: startRfc3339,
            timeZone: ENV.TIMEZONE,
          },
          end: {
            dateTime: endRfc3339,
            timeZone: ENV.TIMEZONE,
          },
        },
      });

      return true;
    } catch (error: any) {
      console.error('[GoogleCalendarService.updateEvent] Failed to update event:', error);
      return false;
    }
  }

  static async deleteEvent(userId: string, eventId: string): Promise<boolean> {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      if (!auth) return false;

      const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client });

      await calendar.events.delete({
        calendarId: auth.calendarId,
        eventId,
      });

      return true;
    } catch (error: any) {
      // 404 or 410 Gone means already removed in Google Calendar
      if (error?.status === 404 || error?.status === 410) {
        return true;
      }
      console.error('[GoogleCalendarService.deleteEvent] Failed to delete event:', error);
      return false;
    }
  }

  static async fetchEvents(
    userId: string = DEFAULT_USER_ID,
    timeMinStr?: string,
    timeMaxStr?: string
  ) {
    try {
      const auth = await this.getAuthenticatedClient(userId);
      if (!auth) return [];

      const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client });

      const timeMin = timeMinStr
        ? new Date(timeMinStr).toISOString()
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const timeMax = timeMaxStr
        ? new Date(timeMaxStr).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await calendar.events.list({
        calendarId: auth.calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const items = response.data.items || [];
      return items.map((item) => {
        const startRaw = item.start?.dateTime || item.start?.date || '';
        const endRaw = item.end?.dateTime || item.end?.date || '';

        let date = '';
        let startTime = '00:00';
        let endTime = '01:00';
        const isAllDay = !item.start?.dateTime;

        if (item.start?.dateTime) {
          const parsed = parseGoogleDateTimeInIST(item.start.dateTime);
          date = parsed.date;
          startTime = parsed.time;
        } else if (item.start?.date) {
          date = item.start.date;
        }

        if (item.end?.dateTime) {
          const parsed = parseGoogleDateTimeInIST(item.end.dateTime);
          endTime = parsed.time;
        }

        return {
          id: item.id || '',
          title: item.summary || '(No Title)',
          description: item.description || null,
          date,
          startTime,
          endTime,
          startDateTime: startRaw,
          endDateTime: endRaw,
          isAllDay,
          htmlLink: item.htmlLink || undefined,
        };
      });
    } catch (error) {
      console.error('[GoogleCalendarService.fetchEvents] Failed to fetch events:', error);
      return [];
    }
  }
}
