import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import WebSocketAPI from "../api/WebSocketApi";
import UserAPI from "../api/UserApi";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const reconnectTimerRef = useRef(null);

  const startReconnectLoop = useCallback((token) => {
    if (reconnectTimerRef.current) return;

    setReconnecting(true);

    reconnectTimerRef.current = setInterval(() => {
      console.log("🔄 Попытка переподключения...");
      wsRef.current?.connect(token);
    }, 3000);
  }, []);

  const stopReconnectLoop = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearInterval(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setReconnecting(false);
  }, []);

  useEffect(() => {
    const token = UserAPI.getAccessToken();
    if (!token) {
      console.warn("⛔ Нет токена — WebSocket не подключается");
      setIsReady(true);
      return;
    }

    const ws = new WebSocketAPI();
    wsRef.current = ws;

    const handleOpen = () => {
      console.log("✅ WebSocket подключён");
      setConnected(true);
      setIsReady(true);
      stopReconnectLoop();
    };

    const handleClose = () => {
      console.warn("🔌 WebSocket закрыт");
      setConnected(false);
      startReconnectLoop(token);
    };

    ws.on("open", handleOpen);
    ws.on("close", handleClose);

    ws.connect(token);

    return () => {
      ws.off("open", handleOpen);
      ws.off("close", handleClose);
      ws.disconnect();
      setConnected(false);
      stopReconnectLoop();
    };
  }, [startReconnectLoop, stopReconnectLoop]);

  // Функции отправки / подписки
  const send = useCallback((event, payload) => {
    wsRef.current?.send(event, payload);
  }, []);

  const on = useCallback((event, handler) => {
    wsRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    wsRef.current?.off(event, handler);
  }, []);

  const value = useMemo(
    () => ({
      connected,
      isReady,
      reconnecting,
      send,
      on,
      off,
      ws: wsRef.current,
    }),
    [connected, isReady, reconnecting]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}

      {/* === Полноэкранный оверлей переподключения === */}
      {reconnecting && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl text-white">
          {/* Radial lime aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(163,230,53,0.15),transparent_70%)]" />

          <div
            className="relative z-10 text-center p-10 rounded-3xl 
                    bg-gray-900/60 border border-gray-800 backdrop-blur-xl 
                    shadow-[0_0_35px_rgba(163,230,53,0.25)] animate-pulse"
          >
            {/* --- DYNAMIC NEON RING (только tailwind стандарт) --- */}
            <div className="flex justify-center mb-6">
              <div className="relative h-28 w-28">
                {/* Вращающееся внешнее кольцо */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-lime-400/70 border-t-lime-400 
                          animate-spin shadow-[0_0_25px_rgba(163,230,53,0.5)]"
                />

                {/* Пульсирующая аура */}
                <div className="absolute inset-2 rounded-full bg-lime-400/30 blur-xl animate-ping" />

                {/* Внутреннее ядро */}
                <div
                  className="absolute inset-6 rounded-full bg-gray-950 border border-lime-400/40 
                          shadow-[0_0_15px_rgba(163,230,53,0.4)] animate-pulse"
                />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-lime-400">
              Переподключение…
            </h2>

            <p className="text-gray-300 max-w-sm mx-auto text-lg">
              Соединение потеряно. Пытаемся восстановить связь с MilkCord.
            </p>
          </div>
        </div>
      )}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be inside WebSocketProvider");
  return ctx;
}
