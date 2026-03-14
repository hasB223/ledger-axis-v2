const { spawn } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [];

function start(name, cwd, args) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code) => {
    if (code !== 0) {
      process.exitCode = code;
      stopAll();
    }
  });

  processes.push(child);
}

function stopAll() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

start('backend', path.join(repoRoot, 'backend'), ['run', 'dev']);
start('frontend', path.join(repoRoot, 'frontend'), ['run', 'start']);
