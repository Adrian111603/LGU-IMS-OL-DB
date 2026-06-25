const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiClient {
  constructor(private readonly getToken: () => string | null) {}

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || response.statusText);
    }
    return response.json() as Promise<T>;
  }

  downloadUrl(path: string) {
    return `${API_URL}${path}`;
  }
}

