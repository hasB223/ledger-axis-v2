import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../src/app/core/services/theme.service';
import { TranslationService } from '../src/app/core/services/translation.service';

describe('TranslationService', () => {
  it('returns translated text with interpolation and falls back to the key', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(TranslationService);

    expect(service.translate('companies.count', { count: 4 })).toBe('4 companies loaded');
    expect(service.translate('missing.key')).toBe('missing.key');
  });
});

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.dataset.theme = '';
  });

  it('applies and persists an explicit theme', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    service.applyTheme('dark');

    expect(document.body.dataset.theme).toBe('dark');
    expect(localStorage.getItem('ledgeraxis.theme')).toBe('dark');
  });

  it('initializes from stored theme before checking media preference', () => {
    localStorage.setItem('ledgeraxis.theme', 'light');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);

    const theme = service.init();

    expect(theme).toBe('light');
    expect(document.body.dataset.theme).toBe('light');
  });
});
