import { Injectable } from '@angular/core';
import en from '../../i18n/en.json';

type Dictionary = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly dictionary = en as Dictionary;

  translate(key: string, params: Record<string, string | number> = {}): string {
    const template = this.dictionary[key] ?? key;
    return Object.entries(params).reduce(
      (message, [param, value]) => message.replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), String(value)),
      template
    );
  }
}
