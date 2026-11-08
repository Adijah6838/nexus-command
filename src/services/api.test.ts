import { describe, it, expect, vi } from 'vitest';
import { api } from './api';

describe('API Service', () => {
  it('should throw an error on failed request', async () => {
    // Mock the global fetch to return a failed response
    vi.stubGlobal('fetch', () => Promise.resolve({ ok: false }));
    
    // Expect the api request to throw an error
    await expect(api.request('/test')).rejects.toThrow('API Error');
    
    // Clean up the mock
    vi.unstubAllGlobals();
  });
});
