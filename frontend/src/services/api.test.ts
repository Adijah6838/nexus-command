import { describe, it, expect, vi } from 'vitest';
import { api } from './api';

describe('API Service', () => {
  it('should throw an error on failed request', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve({ ok: false }));
    await expect(api.request('/test')).rejects.toThrow('API Error');
    vi.unstubAllGlobals();
  });
});
