type Callback<T extends unknown[] = unknown[]> = (...args: T) => void;

export class EventBus {
  private listeners: Record<string, Callback[]> = {};

  on<T extends unknown[] = unknown[]>(event: string, callback: Callback<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback as Callback);
  }

  off<T extends unknown[] = unknown[]>(event: string, callback: Callback<T>): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }

    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  emit<T extends unknown[] = unknown[]>(event: string, ...args: T): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }

    this.listeners[event].forEach((listener) => {
      listener(...args);
    });
  }
}
