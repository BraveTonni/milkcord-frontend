import { useState, useRef } from "react";
import MessagesApi from "../../../app/api/MessagesApi";
import StickersApi from "../../../app/api/StickersApi";
import { formatTimeWithSeconds } from "../../../features/Time";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PMMessage({
  id,
  fromMe,
  text,
  timestamp,
  kind = 1,
  packSlug,
  stickerSlug,
  files = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text || "");
  const [localDeleted, setLocalDeleted] = useState(false);

  const [showActionsMobile, setShowActionsMobile] = useState(false);
  const pressTimer = useRef(null);

  const startPress = () => {
    if (window.innerWidth > 768) return;
    pressTimer.current = setTimeout(() => {
      setShowActionsMobile(true);
    }, 400);
  };

  const endPress = () => {
    clearTimeout(pressTimer.current);
  };

  const timeStr = timestamp
    ? formatTimeWithSeconds(Math.floor(timestamp / 1000))
    : "•••";

  const actionsSide = fromMe ? "right-full -mr-2" : "left-full -ml-2";

  const doDelete = async () => {
    const res = await MessagesApi.deleteMessage(id);
    if (res?.success) setLocalDeleted(true);
  };

  const doEdit = async () => {
    if (!editValue.trim()) return;
    const res = await MessagesApi.editMessage(id, editValue.trim());
    if (res?.success) setIsEditing(false);
  };

  const renderActions = () => (
    <>
      <div
        className={`
          absolute top-0 ${actionsSide}
          hidden md:flex flex-col gap-1
          opacity-0 group-hover:opacity-100
          transition-opacity
          p-1 bg-black/60 backdrop-blur-sm rounded-xl
          z-20
        `}
      >
        {kind === 1 && fromMe && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-300 hover:text-lime-300"
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </button>
        )}

        {fromMe && (
          <button
            onClick={doDelete}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-300 hover:text-red-400"
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {showActionsMobile && (
        <div
          className={`
            absolute top-0 left-1/2 -translate-x-1/2
            flex md:hidden flex-row gap-3
            p-2 bg-black/80 backdrop-blur-md rounded-2xl z-30
          `}
          onClick={() => setShowActionsMobile(false)}
        >
          {kind === 1 && fromMe && (
            <button
              onClick={() => {
                setShowActionsMobile(false);
                setIsEditing(true);
              }}
              className="p-2 rounded-xl bg-gray-700/40 text-gray-200"
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </button>
          )}

          {fromMe && (
            <button
              onClick={() => {
                setShowActionsMobile(false);
                doDelete();
              }}
              className="p-2 rounded-xl bg-gray-700/40 text-gray-200"
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </button>
          )}

          <button
            className="p-2 rounded-xl bg-gray-700/40 text-gray-200"
            onClick={() => setShowActionsMobile(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );

  if (localDeleted) {
    return (
      <div
        className={`flex w-full ${fromMe ? "justify-end" : "justify-start"} mb-3`}
        onTouchStart={startPress}
        onTouchEnd={endPress}
      >
        <div className="text-xs opacity-60 italic px-2 py-1">Сообщение удалено</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        className={`flex w-full ${fromMe ? "justify-end" : "justify-start"} mb-3`}
        onTouchStart={startPress}
        onTouchEnd={endPress}
      >
        <div className="relative px-4 py-3 rounded-2xl text-sm max-w-[75%] bg-gray-800 text-gray-100 border border-gray-700 group">
          {renderActions()}

          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="w-full bg-gray-900/40 p-2 rounded text-gray-200 outline-none resize-none"
          />

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => {
                setEditValue(text);
                setIsEditing(false);
              }}
              className="text-xs text-gray-400"
            >
              Отмена
            </button>

            <button onClick={doEdit} className="text-xs text-lime-400">
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 2) {
    return (
      <div
        className={`flex w-full ${fromMe ? "justify-end" : "justify-start"} mb-4`}
        onTouchStart={startPress}
        onTouchEnd={endPress}
      >
        <div className="relative group">
          {renderActions()}

          <img
            src={StickersApi.getStickerUrl(packSlug, stickerSlug)}
            alt=""
            className="w-40 h-40 object-contain rounded-xl"
          />

          <div
            className={`absolute -bottom-5 right-0 text-[10px] opacity-70 ${
              fromMe ? "text-lime-300" : "text-gray-400"
            }`}
          >
            {timeStr}
          </div>
        </div>
      </div>
    );
  }

  if (kind === 3 && files?.length) {
    return (
      <div
        className={`flex w-full ${fromMe ? "justify-end" : "justify-start"} mb-4`}
        onTouchStart={startPress}
        onTouchEnd={endPress}
      >
        <div className="relative p-3 rounded-2xl max-w-[75%] bg-gray-800/70 border border-gray-700 text-gray-200 group">
          {renderActions()}

          <div className="flex flex-col gap-2">
            {files.map((f) => (
              <a
                key={f.id}
                href={MessagesApi.getFileUrl(f.file_name)}
                target="_blank"
                className="text-lime-300"
              >
                📎 {f.orig_name} ({Math.round(f.file_size / 1024)} KB)
              </a>
            ))}
          </div>

          <div className="absolute bottom-1 right-2 text-[10px] opacity-70 text-gray-400">
            {timeStr}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full ${fromMe ? "justify-end" : "justify-start"} mb-3`}
      onTouchStart={startPress}
      onTouchEnd={endPress}
    >
      <div
        className={`relative px-4 py-2 rounded-2xl text-sm max-w-[75%] group ${
          fromMe
            ? "bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.25)]"
            : "bg-gray-800/80 text-gray-100 border border-gray-700/50"
        }`}
      >
        {renderActions()}

        <div className="mr-10 min-h-6 whitespace-pre-wrap">{text}</div>

        <div
          className={`absolute bottom-1 right-2 text-[10px] opacity-70 ${
            fromMe ? "text-black/70" : "text-gray-400"
          }`}
        >
          {timeStr}
        </div>
      </div>
    </div>
  );
}
