import { useEffect, useState } from "react";
import { Forum, Search, Close } from "@mui/icons-material";

import { useParams, useNavigate } from "react-router-dom";

import { useWebSocket } from "../../../app/providers/WebSocketProvider";
import PMSelectedChat from "../../../components/Profile/Messenger/PMSelectedChat";

import UserAPI from "../../../app/api/UserApi";

import getUserStatus from "../../../features/UserStatus";

import { toast } from "react-toastify";
import ChatsAPI from "../../../app/api/ChatsApi";

export default function ProfileMessenger() {
  const { urlId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const [chats, setChats] = useState([]);

  // Функция для обновления списка чатов
  const fetchChats = async () => {
    const resUser = await UserAPI.getCurrentUser();
    if (!resUser || resUser.error) {
      toast.error(resUser?.error || "Ошибка получения пользователя");
      navigate("/404", { replace: true });
      return;
    }

    const resChats = await ChatsAPI.getAllChats();

    if (!resChats || resChats.error) {
      toast.error(resChats.error || "Не удалось получить чаты");
      return;
    }

    setUser(resUser.user);
    setChats(resChats.chats);
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    navigate(`/messenger/${chat.user.id}`, { replace: true });
  };

  // Функция для возврата к списку чатов
  const goBackToChats = () => {
    setSelectedChat(null);
    navigate("/messenger/", { replace: true });
    // Обновляем список чатов
    fetchChats();
  };

  useEffect(() => {
    (async () => {
      if (!urlId) return;
      if (chats.length === 0) return;

      const chatId = parseInt(urlId);
      let chat = chats.find((chat) => chat.user.id === chatId);

      if (!chat) {
        const res = await ChatsAPI.getChat(chatId);
        if (!res || !res.chat) return;
        chat = res.chat;
      }

      setSelectedChat(chat);
    })();
  }, [urlId, chats]);

  console.log(chats);

  useEffect(() => {
    fetchChats();
  }, []);

  console.log(selectedChat)

  return (
    <section className="flex-1 flex bg-linear-to-b from-black via-gray-900 to-gray-950 text-white border-t border-gray-800 overflow-y-auto px-4 md:px-8 py-6 h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.08),transparent_70%)]"></div>

      <div className="relative z-10 flex flex-1 w-full overflow-hidden bg-gray-900/30 border border-gray-800 rounded-3xl backdrop-blur-md min-w-0 max-h-[79dvh]">
        {/* ===== SIDEBAR ===== */}
        <aside
          className={`
        min-w-0 flex flex-col bg-gray-900/40 border-r border-gray-800 backdrop-blur-md
        w-full md:w-1/3 lg:w-1/4
        transition-all duration-300
        ${selectedChat ? "hidden md:flex" : "flex"}
      `}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <Forum className="text-lime-400" />
              <h2 className="text-xl font-semibold text-lime-400">Чаты</h2>
            </div>
            <button
              onClick={() => {
                if (selectedChat) {
                  // Если чат выбран, возвращаемся к списку чатов
                  goBackToChats();
                } else {
                  // Иначе переключаем состояние поиска
                  setChatSearchOpen((p) => !p);
                  setChatSearchQuery("");
                }
              }}
              className="text-gray-400 hover:text-lime-400 transition"
            >
              {selectedChat && window.innerWidth < 768 ? (
                <Close />
              ) : chatSearchOpen ? (
                <Close />
              ) : (
                <Search />
              )}
            </button>
          </div>

          {!selectedChat && chatSearchOpen && (
            <div className="p-4 border-b border-gray-800">
              <input
                type="text"
                placeholder="Введите имя собеседника..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="w-full p-2 text-sm bg-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {!chatSearchOpen &&
              chats.map((chat) => (
                <div
                  key={chat.user.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-3 mb-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-300 ${
                    selectedChat?.user?.id === chat.user.id
                      ? "bg-lime-400 text-black font-semibold shadow-[0_0_20px_rgba(163,230,53,0.4)]"
                      : "bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-lime-300"
                  }`}
                >
                  <img
                    src={UserAPI.getAvatarUrl(chat.user.avatar_url)}
                    alt={chat.user.username}
                    className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                  />
                  <div>
                    <p>{chat.user.username}</p>
                    <p className="text-xs text-gray-400">
                      {getUserStatus(chat.user.last_seen).substatus}
                    </p>
                  </div>
                </div>
              ))}

            {chatSearchOpen &&
              chatSearchQuery &&
              filteredChats.length === 0 && (
                <p className="text-center text-gray-500 mt-5 text-sm">
                  Ничего не найдено 🕵️‍♂️
                </p>
              )}

            {chatSearchOpen && filteredChats.length > 0 && (
              <>
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setChatSearchOpen(false);
                    }}
                    className="p-3 mb-2 rounded-xl cursor-pointer flex items-center gap-3 bg-gray-800/60 text-gray-300 hover:bg-gray-800 hover:text-lime-300 transition-all duration-300"
                  >
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                    />
                    <div>
                      <p>{chat.name}</p>
                      <p className="text-xs text-gray-400">
                        {chat.online ? "Онлайн" : chat.lastSeen}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* ===== CHAT AREA ===== */}
        <section className={`min-w-0 flex-col min-h-full flex-1 bg-gray-900/40 border-l border-gray-800 rounded-none md:rounded-l-2xl backdrop-blur-md transition-all duration-300 ${selectedChat ? "flex" : "max-md:hidden"}`}>
          {selectedChat ? (
            <PMSelectedChat
              currentChat={selectedChat}
              setChats={setChats}
              user={user}
              goBackToChats={goBackToChats}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-10 md:p-20">
              <Forum className="text-lime-400 mb-3" fontSize="large" />
              <p className="text-lg">Выбери чат, чтобы начать переписку 💬</p>
              <p className="text-gray-500 text-sm mt-2">
                Всё выглядит чище, чем Discord.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
