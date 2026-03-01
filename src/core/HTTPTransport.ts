export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum HTTPStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface RequestOptions {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  data?: Record<string, unknown> | FormData | object;
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
    return this.request(`${url}${queryStr}`, { ...options, method: HTTPMethod.GET });
  };

  post: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: HTTPMethod.POST });
  };

  put: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: HTTPMethod.PUT });
  };

  delete: HTTPMethodFunction = (url, options = {}) => {
    return this.request(url, { ...options, method: HTTPMethod.DELETE });
  };

  private request<R = unknown>(url: string, options: RequestOptions = {}): Promise<R> {
    const { method = HTTPMethod.GET, headers = {}, data, timeout = 5000 } = options;

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

      xhr.onload = (): void => {
        if (xhr.status >= HTTPStatus.OK && xhr.status < 300) {
          resolve(xhr.response as R);
        } else {
          reject(new Error(`HTTP Error: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = (): void => {
        reject(new Error('Network error'));
      };

      xhr.ontimeout = (): void => {
        reject(new Error('Request timeout'));
      };

      xhr.onabort = (): void => {
        reject(new Error('Request aborted'));
      };

      if (method === HTTPMethod.GET || !data) {
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
