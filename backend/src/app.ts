import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import taskRoutes from './routes/task.routes.js';
import todoRoutes from './routes/todo.routes.js';
import bucketRoutes from './routes/bucket.routes.js';
import googleRoutes from './routes/google.routes.js';

export const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'PoornaM',
    time: new Date().toISOString(),
  });
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/bucket', bucketRoutes);
app.use('/api/google', googleRoutes);

// Fallback 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);
