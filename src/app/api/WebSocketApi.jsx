class WebSocketAPI {
  constructor() {
    this.baseUrl = "http://127.0.0.1:7000/api/v1/ws";
    this.ws = null;
    this.eventHandlers = {}; // { eventName: [handlers] }
    this.reconnectDelay = 3000;
    this.autoReconnect = true;
  }

  // === ПОДКЛЮЧЕНИЕ ===
  connect(token = null) {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        return resolve(this.ws);
      }

      let url = this.baseUrl;
      if (token) {
        const sep = url.includes("?") ? "&" : "?";
        url += `${sep}access_token=${encodeURIComponent(token)}`;
      }

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this._trigger("open");
        resolve(this.ws);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event && this.eventHandlers[data.event]) {
            this._trigger(data.event, data.payload);
          } else {
            this._trigger("message", data);
          }
        } catch (err) {
          console.error("Ошибка обработки сообщения WebSocket:", err);
          this._trigger("error", err);
        }
      };

      this.ws.onerror = (err) => {
        console.error("⚠️ Ошибка WebSocket:", err);
        this._trigger("error", err);
      };

      this.ws.onclose = (event) => {
        console.warn("🔌 WebSocket закрыт:", event.reason || event.code);
        this._trigger("close", event);

        if (this.autoReconnect) {
          setTimeout(() => {
            this.connect(token);
          }, this.reconnectDelay);
        }
      };
    });
  }

  // === ПОДПИСКА НА СОБЫТИЯ ===
  on(event, handler) {
    if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
    this.eventHandlers[event].push(handler);
  }

  // === ОТПИСКА ===
  off(event, handler) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(
      (h) => h !== handler
    );
  }

  // === ВНУТРЕННИЙ ТРИГГЕР ===
  _trigger(event, payload) {
    if (!this.eventHandlers[event]) return;
    for (const handler of this.eventHandlers[event]) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Ошибка в обработчике события "${event}":`, err);
      }
    }
  }

  // === ОТПРАВКА СООБЩЕНИЙ ===
  send(event, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket не подключен, сообщение не отправлено");
      return;
    }

    const message = JSON.stringify({ event, payload });
    this.ws.send(message);
  }

  // === ОТКЛЮЧЕНИЕ ===
  disconnect() {
    if (this.ws) {
      this.autoReconnect = false;
      this.ws.close();
      this.ws = null;
    }
  }
}

export default WebSocketAPI;
