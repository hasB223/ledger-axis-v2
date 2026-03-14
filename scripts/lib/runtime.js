const path = require('path');
const { createRequire } = require('module');
const { pathToFileURL } = require('url');

const repoRoot = path.resolve(__dirname, '..', '..');
const backendRoot = path.join(repoRoot, 'backend');
const requireFromBackend = createRequire(path.join(backendRoot, 'package.json'));

process.chdir(backendRoot);
requireFromBackend('dotenv').config({ path: path.join(backendRoot, '.env') });

const importBackend = (relativePath) => import(pathToFileURL(path.join(backendRoot, relativePath)).href);

async function getBackendContext() {
  const [{ env }, { pool, query }] = await Promise.all([
    importBackend('src/shared/config/env.js'),
    importBackend('src/shared/db/pool.js')
  ]);

  return {
    repoRoot,
    backendRoot,
    env,
    pool,
    query,
    requireFromBackend,
    importBackend
  };
}

module.exports = {
  getBackendContext
};
