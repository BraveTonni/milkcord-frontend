import { useState, useRef, useEffect } from "react";
import { Send, EmojiEmotions, ColorLens, AttachFile } from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import MessagesApi from "../../../app/api/MessagesApi";
import { toast } from "react-toastify";
import PMStickerPicker from "./PMStickerPicker";

export default function PMNewMessage({ selectedChat, setChats }) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const typing = message.trim().length > 0;

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // === Send text or sticker ===
  const handleSendMessage = async (content = message, type = "text") => {
    if ((!content.trim() && type === "text") || !selectedChat) return;

    const res = await MessagesApi.sendMessage(selectedChat.user.id, content, type);
    if (res.error) {
      toast.error("Ошибка отправки");
      return;
    }

    const sentMessage = res.message;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: Array.isArray(chat.messages)
                ? [...chat.messages, sentMessage]
                : [sentMessage],
            }
          : chat
      )
    );

    setMessage("");
    setShowEmoji(false);
    setShowStickers(false);
  };

  // === Send file ===
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    const res = await MessagesApi.sendFileMessage(selectedChat.user.id, file);

    if (res.error) {
      toast.error("Ошибка отправки файла");
      return;
    }

    const sentMessage = res.message;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: Array.isArray(chat.messages)
                ? [...chat.messages, sentMessage]
                : [sentMessage],
            }
          : chat
      )
    );

    e.target.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative p-4 xs:p-2 border-t border-gray-800 bg-gray-900/60 shrink-0">

      <div className="relative flex items-center bg-gray-800 border border-gray-700 rounded-xl px-2 py-1">

        {/* ==== LEFT ICONS ==== */}
        <div className="flex items-center gap-1 max-xs:gap-0 mr-2">

          {/* Emoji – always visible */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEmoji(!showEmoji);
                setShowStickers(false);
              }}
              className="text-lime-400 hover:text-lime-300 p-1 rounded-lg hover:bg-gray-700 transition"
            >
              <EmojiEmotions fontSize="small" />
            </button>

            {showEmoji && (
              <div ref={emojiPickerRef} className="absolute bottom-12 left-0 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  lazyLoadEmojis
                  searchDisabled
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                  width={320}
                  height={380}
                />
              </div>
            )}
          </div>

          {/* Stickers – hide on mobile while typing */}
          {!(isMobile && typing) && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowStickers(!showStickers);
                  setShowEmoji(false);
                }}
                className="text-lime-400 hover:text-lime-300 p-1 rounded-lg hover:bg-gray-700 transition"
              >
                <ColorLens fontSize="small" />
              </button>

              {showStickers && (
                <PMStickerPicker
                  userId={selectedChat.user.id}
                  onClose={() => setShowStickers(false)}
                />
              )}
            </div>
          )}

          {/* Files – hide on mobile while typing */}
          {!(isMobile && typing) && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-lime-400 hover:text-lime-300 p-1 rounded-lg hover:bg-gray-700 transition"
              >
                <AttachFile fontSize="small" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* ==== TEXT AREA ==== */}
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Калякай..."
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none py-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 max-xs:text-sm"
        />

        {/* ==== SEND BUTTON ==== */}
        <button
          onClick={() => handleSendMessage()}
          disabled={!message.trim()}
          className="ml-2 bg-lime-400 disabled:bg-gray-700 text-black disabled:text-lime-400 py-1 px-2 rounded-lg hover:bg-lime-300 transition disabled:cursor-not-allowed"
        >
          <Send fontSize="small" />
        </button>
      </div>
    </div>
  );
}
