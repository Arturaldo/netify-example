import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HTTPTransport, HTTPMethod } from './HTTPTransport';

let lastXhr!: MockXMLHttpRequest;

class MockXMLHttpRequest {
  method: string = '';
  url: string = '';
  requestHeaders: Record<string, string> = {};
  requestBody: unknown = null;
  withCredentials: boolean = false;
  responseType: string = '';
  timeout: number = 0;
  status: number = 200;
  statusText: string = 'OK';
  response: unknown = null;

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastXhr = this;
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string): void {
    this.requestHeaders[key] = value;
  }

  send(body?: unknown): void {
    this.requestBody = body ?? null;
  }

  respondWith(status: number, response: unknown): void {
    this.status = status;
    this.statusText = status >= 200 && status < 300 ? 'OK' : 'Error';
    this.response = response;
    this.onload?.();
  }

  triggerNetworkError(): void {
    this.onerror?.();
  }

  triggerTimeout(): void {
    this.ontimeout?.();
  }
}

describe('HTTPTransport', () => {
  beforeEach(() => {
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GET', () => {
    it('отправляет GET-запрос на правильный URL', async () => {
      const transport = new HTTPTransport('https://api.example.com');
      const promise = transport.get('/users');
      lastXhr.respondWith(200, { id: 1 });
      await promise;
      expect(lastXhr.method).toBe(HTTPMethod.GET);
      expect(lastXhr.url).toBe('https://api.example.com/users');
    });

    it('формирует строку запроса из data', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/search', { data: { q: 'test', page: 1 } });
      lastXhr.respondWith(200, []);
      await promise;
      expect(lastXhr.url).toContain('q=test');
      expect(lastXhr.url).toContain('page=1');
    });

    it('не добавляет строку запроса при отсутствии data', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/items');
      lastXhr.respondWith(200, []);
      await promise;
      expect(lastXhr.url).toBe('/items');
    });

    it('возвращает ответ при успешном запросе', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/data');
      lastXhr.respondWith(200, { ok: true });
      const result = await promise;
      expect(result).toEqual({ ok: true });
    });

    it('устанавливает withCredentials = true', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/data');
      lastXhr.respondWith(200, null);
      await promise;
      expect(lastXhr.withCredentials).toBe(true);
    });
  });

  describe('POST', () => {
    it('отправляет POST-запрос с JSON-телом', async () => {
      const transport = new HTTPTransport('');
      const body = { login: 'user', password: '123' };
      const promise = transport.post('/login', { data: body });
      lastXhr.respondWith(200, { token: 'abc' });
      await promise;
      expect(lastXhr.method).toBe(HTTPMethod.POST);
      expect(lastXhr.requestBody).toBe(JSON.stringify(body));
    });

    it('устанавливает Content-Type: application/json для объектов', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.post('/data', { data: { key: 'value' } });
      lastXhr.respondWith(200, null);
      await promise;
      expect(lastXhr.requestHeaders['Content-Type']).toBe('application/json');
    });

    it('отправляет FormData без Content-Type заголовка', async () => {
      const transport = new HTTPTransport('');
      const formData = new FormData();
      formData.append('file', 'content');
      const promise = transport.post('/upload', { data: formData });
      lastXhr.respondWith(200, null);
      await promise;
      expect(lastXhr.requestHeaders['Content-Type']).toBeUndefined();
    });
  });

  describe('PUT', () => {
    it('отправляет PUT-запрос', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.put('/user/1', { data: { name: 'New' } });
      lastXhr.respondWith(200, { name: 'New' });
      await promise;
      expect(lastXhr.method).toBe(HTTPMethod.PUT);
    });
  });

  describe('DELETE', () => {
    it('отправляет DELETE-запрос', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.delete('/user/1');
      lastXhr.respondWith(200, null);
      await promise;
      expect(lastXhr.method).toBe(HTTPMethod.DELETE);
    });
  });

  describe('Обработка ошибок', () => {
    it('отклоняет промис при HTTP-статусе >= 400', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/protected');
      lastXhr.respondWith(401, null);
      await expect(promise).rejects.toThrow('HTTP Error');
    });

    it('отклоняет промис при сетевой ошибке', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/data');
      lastXhr.triggerNetworkError();
      await expect(promise).rejects.toThrow('Network error');
    });

    it('отклоняет промис при таймауте', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/slow');
      lastXhr.triggerTimeout();
      await expect(promise).rejects.toThrow('Request timeout');
    });

    it('устанавливает пользовательский таймаут', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/data', { timeout: 10000 });
      lastXhr.respondWith(200, null);
      await promise;
      expect(lastXhr.timeout).toBe(10000);
    });
  });

  describe('Заголовки', () => {
    it('передаёт пользовательские заголовки в запрос', async () => {
      const transport = new HTTPTransport('');
      const promise = transport.get('/data', {
        headers: { Authorization: 'Bearer token123' },
      });
      lastXhr.respondWith(200, null);
      await promise;
      expect(lastXhr.requestHeaders['Authorization']).toBe('Bearer token123');
    });
  });
});
