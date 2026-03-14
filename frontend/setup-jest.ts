import { jest } from '@jest/globals';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone/index.mjs';

setupZoneTestEnv();

(globalThis as typeof globalThis & { jest: typeof jest }).jest = jest;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((...args: unknown[]) => ({
    matches: String(args[0] ?? '').includes('dark'),
    media: String(args[0] ?? ''),
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});
