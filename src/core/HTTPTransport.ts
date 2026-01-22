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

function queryStringify(data: Record<string, unknown>): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const params = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    });

  return params.length ? `?${params.join('&')}` : '';
}

export class HTTPTransport {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  get: HTTPMethodFunction = (url, options = {}) => {
    const queryStr = options.data ? queryStringify(options.data as Record<string, unknown>) : '';
    return this.request(`${url}${queryStr}`, { ...options, method: 'GET' });
  };

  post: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: 'POST' });
  };

  put: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: 'PUT' });
  };

  delete: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: 'DELETE' });
  };

  private request<R = unknown>(url: string, options: RequestOptions = {}): Promise<R> {
    const { method = 'GET', headers = {}, data, timeout = 5000 } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullUrl = `${this.baseUrl}${url}`;

      xhr.open(method, fullUrl);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.timeout = timeout;
      xhr.withCredentials = true;
      xhr.responseType = 'json';

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

      if (method === 'GET' || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    });
  }
}
