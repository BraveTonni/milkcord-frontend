import { useState } from "react";
import { PhotoCamera } from "@mui/icons-material";
import UserAPI from "../../../app/api/UserApi";
import PHCoverModal from "./PHCoverModal";
import getUserStatus from "../../../features/UserStatus";

export default function PHCover({ user, setUser, editingProfile }) {
  const [showModal, setShowModal] = useState(false);
  const { status, substatus } = getUserStatus(user?.last_seen);

  return (
    <>
      <div className="relative h-48 w-full overflow-hidden rounded-t-3xl group">
        <img
          src={UserAPI.getCoverUrl(user.cover_url)}
          alt="cover"
          className="object-cover w-full h-full"
        />

        {/* Градиент */}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />

        {/* Статус */}
        <div className="absolute top-4 right-4 flex gap-2 bg-black/60 backdrop-blur-sm px-5 py-2 rounded-full font-medium">
          <div
            className={`w-3 h-3 rounded-full my-auto ${
              status === "В сети" ? "bg-green-400" : "bg-gray-500 animate-pulse"
            }`}
          />
          <div className="text-sm">
            <div className="text-gray-200">{status}</div>
            <div className="text-gray-400 text-xs">{substatus}</div>
          </div>
        </div>

        {/* Кнопка редактирования — только в режиме редактирования */}
        {editingProfile && (
          <button
            onClick={() => setShowModal(true)}
            className="absolute bottom-4 right-4 bg-gray-950/80 backdrop-blur-sm border border-lime-400/40 p-3 rounded-xl 
                       hover:bg-lime-400 hover:text-black transition shadow-lg"
          >
            <PhotoCamera />
          </button>
        )}
      </div>

      {/* Модалка */}
      {showModal && (
        <PHCoverModal user={user} setUser={setUser} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}