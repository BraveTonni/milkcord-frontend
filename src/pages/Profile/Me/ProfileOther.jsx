import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import UserAPI from "../../../app/api/UserApi";
import Loader from "../../../components/Loader/Loader";

import ProfileFriends from "../../../components/Profile/Friends/ProfileFriends";
import ProfilePostsOther from "../../../components/Profile/Posts/Other/ProfilePostsOther";
import ProfileHeaderOther from "../../../components/Profile/Header/Other/ProfileHeaderOther";

export default function ProfileOther({ username }) {
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // === ЗАГРУЗКА ДАННЫХ ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUser = await UserAPI.getCurrentUser();
        if (!resUser || resUser.error) {
          toast.error(resUser?.error || "Ошибка получения пользователя");
          navigate("/404", { replace: true });
          return;
        }

        const resOther = await UserAPI.getUser(username);
        if (!resOther || resOther.error) {
          toast.error(resOther?.error || "Пользователь не найден");
          navigate("/404", { replace: true });
          return;
        }

        if (resUser.user.id === resOther.user.id) {
          navigate("/profile", { replace: true });
          return;
        }

        setUser(resUser.user);
        setOtherUser(resOther.user);
      } catch (err) {
        console.error(err);
        toast.error("Ошибка при загрузке профиля");
        navigate("/404", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  if (loading || !user || !otherUser) return <Loader>Загрузка...</Loader>;

  return (
    <section className="relative min-h-screen bg-linear-to-b from-black via-gray-900 to-gray-950 text-white pt-4">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">
        <ProfileHeaderOther user={user} otherUser={otherUser} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-6">
            <ProfileFriends user={otherUser} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProfilePostsOther user={user} otherUser={otherUser} />
          </div>
        </div>
      </div>
    </section>
  );
}
