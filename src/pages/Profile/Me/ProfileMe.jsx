import { useEffect, useState } from "react";
import UserAPI from "../../../app/api/UserApi";

import { toast } from "react-toastify";
import Loader from "../../../components/Loader/Loader";

import ProfileHeader from "../../../components/Profile/Header/ProfileHeader";
import ProfileFriends from "../../../components/Profile/Friends/ProfileFriends";
import ProfilePosts from "../../../components/Profile/Posts/Self/ProfilePosts";

export default function ProfileMe() {
  const [editingProfile, setEditingProfile] = useState(false);
  const [user, setUser] = useState(null);

  // === ЗАГРУЗКА ДАННЫХ ===
  useEffect(() => {
    (async () => {
      const resUser = await UserAPI.getCurrentUser();
      if (!resUser.error) {
        setUser(resUser.user);
      } else {
        toast.error(resUser.error);
        return;
      }
    })();
  }, []);

  if (!user) return <Loader>Загрузка...</Loader>;

  return (
    <section className="relative min-h-screen bg-linear-to-b from-black via-gray-900 to-gray-950 text-white pt-4">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">
        <ProfileHeader
          user={user}
          setUser={setUser}
          editingProfile={editingProfile}
          setEditingProfile={setEditingProfile}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка */}
          <div className="flex flex-col gap-6">
            <ProfileFriends user={user} />
          </div>

          {/* Правая колонка: посты */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProfilePosts user={user} />
          </div>
        </div>
      </div>
    </section>
  );
}
