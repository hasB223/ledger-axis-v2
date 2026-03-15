export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/db'],
  globalSetup: '<rootDir>/tests/db/global-setup.js',
  globalTeardown: '<rootDir>/tests/db/global-teardown.js',
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/db/setup-after-env.js'],
  testPathIgnorePatterns: ['/node_modules/']
};
