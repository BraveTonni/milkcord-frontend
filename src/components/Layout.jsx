import { useLocation } from "react-router-dom";
import RouterProvider from "../app/providers/RouterProvider";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import AuthenticatedHeader from "./Header/AuthenticatedHeader";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../app/providers/AuthProvider";
import { useWebSocket } from "../app/providers/WebSocketProvider";
import { useEffect, useState } from "react";

import Loader from "./Loader/Loader";
import AuthenticatedFooter from "./Footer/AuthenticatedFooter";

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  // Локальное состояние для отслеживания первого успешного подключения
  const [wsReady, setWsReady] = useState(false);

  const simpleHeaderPaths = ["/", "/login", "/register"];
  const isSimpleHeader = simpleHeaderPaths.includes(location.pathname);

  const { connected, send, on, off } = useWebSocket();

  // Отслеживаем изменение статуса подключения
  useEffect(() => {
    if (isSimpleHeader) return;

    if (connected) {
      setWsReady(true);
    }
  }, [connected]);

  // Подписка на сообщения (остаётся как было)
  useEffect(() => {
    const messageNotify = (data) => {
      if (data.self === true) return;
      if (location.pathname.includes(`/messenger/${data.from.id}`)) return;

      toast.info(`${data.from.username}: ${data.content}`, {
        onClick: () => {
          window.location.href = `/messenger/${data.from.id}`;
        },
      });
    };

    on("message", messageNotify);
    return () => off("message", messageNotify);
  }, [on, off, location]);

  // Если WebSocket ещё не подключился — показываем лоадер на весь экран
  if (!wsReady && !isSimpleHeader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader>Загрузка...</Loader>
      </div>
    );
  }

  // Когда подключился — рендерим обычный layout
  return (
    <div className="flex flex-col min-h-screen bg-black text-white no-scrollbar">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover={false}
        theme="dark"
      />

      {isSimpleHeader ? (
        <Header show={!isSimpleHeader} />
      ) : (
        user && <AuthenticatedHeader user={user} />
      )}

      <main className="flex flex-col flex-1">
        <RouterProvider />
      </main>

      {isSimpleHeader ? <Footer /> : user && <AuthenticatedFooter />}
    </div>
  );
}
