import { Edit, CalendarMonth } from "@mui/icons-material";

import { formatDate } from "../../../features/Time";

import { useState } from "react";

import UserAPI from "../../../app/api/UserApi";

import { toast } from "react-toastify";

export default function PHInfo({ user, setUser, editingProfile, setEditingProfile }) {
  const [bioText, setBioText] = useState(user.bio);

  const handleSaveBio = async () => {
    if (bioText.length > 100) {
      toast.error("Текст не должен превышать 100 символов");
      return;
    }

    const res = await UserAPI.updateBio(bioText);
    if (res.error) {
      toast.error(res.error);
    } else {
      setUser(res.user);
      setEditingProfile(false);
      toast.success("Информация обновлена");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center mt-6 md:mt-0">
      <div className="flex flex-wrap items-center justify-between mb-3">
        <h1 className="text-3xl font-bold text-lime-400 cursor-pointer hover:text-lime-300 transition">
          {user.username}
        </h1>
        <button
          onClick={() => setEditingProfile((prev) => !prev)}
          className="px-4 py-2 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Edit fontSize="small" />
          <span className="hidden md:inline">Редактировать</span>
        </button>
      </div>

      {editingProfile ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-gray-200 focus:border-lime-400 focus:outline-none resize-none"
            rows={3}
            placeholder="Введите новое описание..."
            maxLength={100}
          />
          <div className="text-right text-xs text-gray-500">
            {bioText?.length}/100
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveBio}
              className="px-4 py-2 bg-lime-400 text-black rounded-xl font-semibold hover:bg-lime-300 transition"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setBioText(user.bio || "");
                setEditingProfile(false);
              }}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <p
          className="text-gray-400 mb-2 text-lg cursor-pointer hover:text-gray-300 transition wrap-break-word whitespace-pre-line"
          onClick={() => setEditingProfile(true)}
        >
          {user.bio || "Пока без описания — зато с вайбом"}
        </p>
      )}

      <div className="flex flex-wrap gap-5 text-gray-400 mt-3 text-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:text-lime-300 transition">
          <CalendarMonth fontSize="small" className="text-lime-400" />
          Дата регистрации: {formatDate(user.created_at)}
        </div>
      </div>
    </div>
  );
}
