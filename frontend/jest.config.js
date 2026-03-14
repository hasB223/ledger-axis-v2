const { createEsmPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createEsmPreset(),
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  transformIgnorePatterns: ['node_modules/(?!tslib|rxjs|@angular)'],
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.model.ts',
    '!src/**/*.store.ts',
    '!src/**/*.state.ts'
  ]
};
