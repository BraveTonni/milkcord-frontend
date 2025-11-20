import { useState, useEffect, useRef } from "react";

import PMMessage from "../../../components/Profile/Messenger/PMMessage";
import PMNewMessage from "../../../components/Profile/Messenger/PMNewMessage";

import { ArrowBack, Call, Search, Close } from "@mui/icons-material";
import UserAPI from "../../../app/api/UserApi";

import { useWebSocket } from "../../../app/providers/WebSocketProvider";

import MessagesApi from "../../../app/api/MessagesApi";

import getUserStatus from "../../../features/UserStatus";

import { useCall } from "../../../features/call/CallProvider";
import { useNavigate } from "react-router-dom";

export default function PMSelectedChat({
  user,
  currentChat,
  setChats,
  goBackToChats,
}) {
  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [messages, setMessages] = useState(currentChat?.messages || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { startCall } = useCall();

  const { send, on, off } = useWebSocket();

  const navigate = useNavigate();

  const chatId = currentChat?.id;

  const loadMessages = async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    const res = await MessagesApi.getMessages(chatId);
    if (res.error) {
      setError(res.error);
    } else {
      setMessages(res || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleTextMessage = (payload) => {
      if (!currentChat) return;
      if (!payload?.from?.id) return;
      if (!payload.self && payload.from.id !== currentChat.user.id) return;

      const newMsg = {
        id: payload.id || Date.now(),
        kind: 1,
        content: payload.content || "",
        from_user: { id: payload.from.id },
        created_at: payload.created_at || Date.now(),
      };

      setMessages((prev) => [...prev, newMsg]);
    };

    const handleStickerMessage = (payload) => {
      if (!currentChat) return;
      if (!payload.self && payload.from.id !== currentChat.user.id) return;

      const newMsg = {
        id: payload.id || Date.now(),
        kind: 2,
        pack_slug: payload.pack,
        sticker_slug: payload.sticker,
        from_user: { id: payload.from.id },
        created_at: payload.created_at || Date.now(),
      };

      setMessages((prev) => [...prev, newMsg]);
    };

    const handleFileMessage = (payload) => {
      if (!currentChat) return;
      if (!payload.self && payload.from?.id !== currentChat.user.id) return;

      const newMsg = {
        id: payload.id || Date.now(),
        kind: 3,
        files: payload.files || [],
        from_user: { id: payload.from?.id },
        created_at: payload.created_at || Date.now(),
      };

      setMessages((prev) => [...prev, newMsg]);
    };

    const handleDeleteMessage = (payload) => {
      if (!payload.id) return;
      setMessages((prev) => prev.filter((m) => m.id !== payload.id));
    };

    const handleEditMessage = (payload) => {
      if (!payload.id) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.id
            ? { ...m, content: payload.new_text, edited: true }
            : m
        )
      );
    };

    on("message", handleTextMessage);
    on("message:sticker", handleStickerMessage);
    on("message:file", handleFileMessage);
    on("message:delete", handleDeleteMessage);
    on("message:edit", handleEditMessage);

    return () => {
      off("message", handleTextMessage);
      off("message:sticker", handleStickerMessage);
      off("message:file", handleFileMessage);
      off("message:delete", handleDeleteMessage);
      off("message:edit", handleEditMessage);
    };
  }, [on, off, currentChat, user.id]);

  const filteredMessages = msgSearchQuery
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(msgSearchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col w-full overflow-hidden bg-gray-900 min-h-0">
      {/* HEADER */}
      <div className="px-3 max-xs:px-2 py-3 border-b border-gray-800 flex justify-between items-center shrink-0 bg-gray-900 sticky top-0 z-20">
        <div className="flex items-center gap-3 max-xs:gap-2 min-w-0">
          <button
            onClick={goBackToChats} // используем переданную функцию
            className="text-gray-400 hover:text-lime-400 transition p-2 rounded-full md:hidden"
          >
            <ArrowBack />
          </button>

          <a
            href={`/profile/${currentChat.user.username}`}
            className="flex items-center gap-3 max-xs:gap-2 min-w-0"
          >
            <img
              src={UserAPI.getAvatarUrl(currentChat?.user?.avatar_url)}
              alt={currentChat.user?.username}
              className="rounded-full border border-gray-700 object-cover
                     w-10 h-10 max-xs:w-8 max-xs:h-8"
            />

            <div className="leading-tight min-w-0">
              <h3
                className="text-lime-400 font-semibold truncate
                         text-base xs:text-lg max-xs:max-w-[100px] xs:max-w-[140px]"
              >
                {currentChat.user?.username}
              </h3>
              <p className="text-gray-400 truncate text-xs xs:text-sm">
                {getUserStatus(currentChat.user?.last_seen).substatus}
              </p>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-1 xs:gap-2">
          <button
            onClick={() => {
              setMsgSearchOpen((p) => !p);
              setMsgSearchQuery("");
            }}
            className="text-gray-400 hover:text-lime-400 transition p-2 rounded-full hover:bg-gray-800"
          >
            {msgSearchOpen ? <Close /> : <Search />}
          </button>

          <button
            onClick={() =>
              startCall({
                user: currentChat.user,
                chatId: currentChat.id,
              })
            }
            className="text-gray-400 hover:text-lime-400 transition p-2 rounded-full hover:bg-gray-800"
          >
            <Call />
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      {msgSearchOpen && (
        <div className="px-3 max-xs:px-2 py-2 border-b border-gray-800 bg-gray-900 sticky top-[56px] z-20">
          <input
            type="text"
            placeholder="Поиск по сообщениям..."
            value={msgSearchQuery}
            onChange={(e) => setMsgSearchQuery(e.target.value)}
            className="w-full p-2 text-sm bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex h-full flex-col overflow-y-auto px-3 max-xs:px-2 py-3 max-xs:py-2 gap-3 custom-scrollbar">
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-10">Загрузка...</p>
        ) : error ? (
          <p className="text-red-400 text-sm text-center mt-10">{error}</p>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <PMMessage
              key={msg.id}
              id={msg.id}
              fromMe={msg.from_user.id == user.id}
              kind={msg.kind}
              text={msg.kind === 1 ? msg.content : null}
              packSlug={msg.kind === 2 ? msg.pack_slug : null}
              stickerSlug={msg.kind === 2 ? msg.sticker_slug : null}
              timestamp={msg.created_at}
              files={msg.files}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-10">
            Сообщения не найдены
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* NEW MESSAGE */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-3 max-xs:px-2 py-2">
        <PMNewMessage selectedChat={currentChat} setChats={setChats} />
      </div>
    </div>
  );
}
