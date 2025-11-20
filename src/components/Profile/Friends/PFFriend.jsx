import { Psychology } from "@mui/icons-material";
import UserAPI from "../../../app/api/UserApi";

export default function PFFriend({ user }) {
  return (
    <a
      key={user.id}
      href={`/profile/${user.username}`}
      className="group flex flex-col items-center text-center p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-lime-400/10"
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden mb-2 bg-gray-700 flex items-center justify-center">
        <img
            src={UserAPI.getAvatarUrl(user.avatar_url)}
            alt={user.username}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
      </div>

      <p className="text-sm font-semibold text-white truncate w-full">
        {user.username}
      </p>
    </a>
  );
}
