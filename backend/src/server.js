import { createApp } from './app.js';
import { env } from './shared/config/env.js';

const app = createApp();

app.listen(env.port, () => {
  // TODO: replace console usage with structured logger once logging module is implemented.
  console.log(`LedgerAxis backend listening on port ${env.port}`);
});
