const API_URL = 'http://127.0.0.1:8000/api';

export const api = {
  request: async (endpoint: string, options: RequestInit = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
};
