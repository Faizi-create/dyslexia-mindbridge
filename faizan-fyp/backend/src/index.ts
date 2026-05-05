import { createApp } from './app';
import { connectMongo } from '@/config/db';
import { initFirebaseAdmin } from '@/config/firebaseAdmin';
import { env } from '@/config/env';

async function main() {
  initFirebaseAdmin();
  await connectMongo();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('[server] fatal startup error', err);
  process.exit(1);
});
