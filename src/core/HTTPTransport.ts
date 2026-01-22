type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  data?: Record<string, unknown> | FormData;
  timeout?: number;
}

type HTTPMethodFunction = <R = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'>
) => Promise<R>;

/**
 * Преобразует объект в query string
 * { a: 1, b: 'test' } → '?a=1&b=test'
 */
function queryStringify(data: Record<string, unknown>): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const params = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        // Массив: arr=[1,2,3] → arr=1&arr=2&arr=3
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    });

  return params.length ? `?${params.join('&')}` : '';
}

/**
 * Класс для работы с HTTP запросами на основе XMLHttpRequest.
 * Fetch, axios и подобные инструменты не используются.
 *
 * @example
 * const api = new HTTPTransport('/api');
 *
 * // GET запрос с query параметрами
 * const users = await api.get('/users', { data: { page: 1, limit: 10 } });
 * // → GET /api/users?page=1&limit=10
 *
 * // POST запрос с JSON body
 * const newUser = await api.post('/users', {
 *   data: { name: 'John', email: 'john@example.com' }
 * });
 *
 * // PUT запрос
 * await api.put('/users/1', { data: { name: 'John Updated' } });
 *
 * // DELETE запрос
 * await api.delete('/users/1');
 */
export class HTTPTransport {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * GET запрос
   * Данные передаются как query string параметры
   */
  get: HTTPMethodFunction = (url, options = {}) => {
    const queryStr = options.data ? queryStringify(options.data as Record<string, unknown>) : '';
    return this.request(`${url}${queryStr}`, { ...options, method: 'GET' });
  };

  /**
   * POST запрос
   * Данные передаются в body запроса
   */
  post: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: 'POST' });
  };

  /**
   * PUT запрос
   * Данные передаются в body запроса
   */
  put: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: 'PUT' });
  };

  /**
   * DELETE запрос
   * Данные могут передаваться в body запроса
   */
  delete: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: 'DELETE' });
  };

  /**
   * Основной метод для выполнения запросов
   * Использует XMLHttpRequest и возвращает Promise
   */
  private request<R = unknown>(url: string, options: RequestOptions = {}): Promise<R> {
    const { method = 'GET', headers = {}, data, timeout = 5000 } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullUrl = `${this.baseUrl}${url}`;

      xhr.open(method, fullUrl);

      // Устанавливаем заголовки
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.timeout = timeout;
      xhr.withCredentials = true;
      xhr.responseType = 'json';

      // Обработчики событий
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as R);
        } else {
          reject(new Error(`HTTP Error: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      xhr.onabort = () => {
        reject(new Error('Request aborted'));
      };

      // Отправка запроса
      if (method === 'GET' || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        // FormData отправляем как есть (браузер сам выставит Content-Type)
        xhr.send(data);
      } else {
        // JSON данные
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  }
}
