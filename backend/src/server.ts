import { app } from './app.js';
import { ENV } from './config/env.js';
import { ensureDefaultUser } from './config/prisma.js';

async function bootstrap() {
  try {
    await ensureDefaultUser();
    console.log('[PoornaM Backend] Default user initialized.');

    app.listen(ENV.PORT, () => {
      console.log(`[PoornaM Backend] Server running at http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error('[PoornaM Backend] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
