import { useState } from "react";
import { PhotoCamera } from "@mui/icons-material";
import UserAPI from "../../../app/api/UserApi";
import PHAvatarModal from "./PHAvatarModal";

export default function PHAvatar({ user, setUser, editingProfile }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* === Аватар === */}
      <div
        onClick={() => (editingProfile ? setShowModal(true) : null)}
        className="relative shrink-0 cursor-pointer group max-h-fit"
      >
        <div
          className="w-40 h-40 rounded-2xl bg-gray-900 border border-lime-400/40 overflow-hidden 
                     flex items-center justify-center text-5xl font-bold text-white
                     shadow-[0_0_30px_rgba(163,230,53,0.25)] transition-transform duration-300
                     group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(163,230,53,0.45)]"
        >
          <img
              src={UserAPI.getAvatarUrl(user.avatar_url)}
              alt="avatar"
              className="w-full h-full object-cover"
            />
        </div>

        {editingProfile && (
          <div className="absolute bottom-2 right-2 bg-gray-950/80 border border-lime-400/40 p-2 rounded-xl hover:bg-lime-400 hover:text-black transition">
            <PhotoCamera fontSize="small" />
          </div>
        )}
      </div>

      {/* === Модалка через портал === */}
      {showModal && (
        <PHAvatarModal
          user={user}
          setUser={setUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
