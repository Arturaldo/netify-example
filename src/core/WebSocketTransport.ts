export interface WSMessage {
  id?: number;
  content: string;
  type: string;
  time?: string;
  user_id?: number;
}

export class WebSocketTransport {
  private socket: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private url: string;

  private _onMessage: ((data: WSMessage | WSMessage[]) => void) | null = null;
  private _onOpen: (() => void) | null = null;
  private _onClose: (() => void) | null = null;
  private _onError: ((error: Event) => void) | null = null;

  constructor(userId: number, chatId: number, token: string) {
    this.url = `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`;
  }

  set onMessage(cb: (data: WSMessage | WSMessage[]) => void) {
    this._onMessage = cb;
  }

  set onOpen(cb: () => void) {
    this._onOpen = cb;
  }

  set onClose(cb: () => void) {
    this._onClose = cb;
  }

  set onError(cb: (error: Event) => void) {
    this._onError = cb;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);

      this.socket.addEventListener('open', () => {
        this._startPing();
        if (this._onOpen) this._onOpen();
        resolve();
      });

      this.socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this._onMessage && data.type !== 'pong') {
            this._onMessage(data);
          }
        } catch {
          console.error('WebSocket: failed to parse message');
        }
      });

      this.socket.addEventListener('close', () => {
        this._stopPing();
        if (this._onClose) this._onClose();
      });

      this.socket.addEventListener('error', (event) => {
        if (this._onError) this._onError(event);
        reject(event);
      });
    });
  }

  send(content: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        content,
        type: 'message',
      }));
    }
  }

  getOldMessages(offset: number = 0) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        content: String(offset),
        type: 'get old',
      }));
    }
  }

  close() {
    this._stopPing();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private _startPing() {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private _stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
