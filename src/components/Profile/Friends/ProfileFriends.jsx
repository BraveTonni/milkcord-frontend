import { useEffect, useState } from "react";
import { Group } from "@mui/icons-material";
import { toast } from "react-toastify";
import FriendsAPI from "../../../app/api/FriendsApi";
import PFFriend from "./PFFriend";

export default function ProfileFriends({ user }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // === Получение друзей ===
  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      const data = await FriendsAPI.getFriends(user.username);
      setLoading(false);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setFriends(data.friends || []);
    };

    if (user?.username) fetchFriends();
  }, [user.username]);

  // === JSX ===
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm hover:border-lime-400/40 transition">
      <div className="flex items-center gap-2 mb-4">
        <Group className="text-lime-400" />
        <h2 className="text-lg font-semibold text-white">Друзья</h2>
      </div>

      {/* === Состояния === */}
      {loading ? (
        <p className="text-gray-400 text-sm">Загрузка...</p>
      ) : friends.length === 0 ? (
        <p className="text-gray-500 text-sm">Пока нет друзей</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {friends.map((friend) => (
            <PFFriend key={friend.id} user={friend} />
          ))}
        </div>
      )}
    </div>
  );
}
