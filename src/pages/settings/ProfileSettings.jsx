import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import UserAPI from "../../app/api/UserApi";

import { Person, Email, Lock, Save } from "@mui/icons-material";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // === LOAD USER ===
  useEffect(() => {
    (async () => {
      const resUser = await UserAPI.getCurrentUser();

      if (!resUser.error) {
        setUser(resUser.user);

        setUsername(resUser.user.username);
        setEmail(resUser.user.email);
      } else {
        toast.error(resUser.error);
      }
    })();
  }, []);

  if (!user) return <div className="text-white p-10">Загрузка...</div>;

  const handleSave = async () => {
    setLoading(true);

    const payload = {
      username,
      email,
    };

    if (password.trim()) payload.password = password;

    const res = await UserAPI.updateSettings(payload);

    if (res?.success) toast.success("Настройки успешно сохранены");
    else toast.error(res?.error || "Ошибка при сохранении");

    setLoading(false);
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-gradient-to-b from-black via-gray-900 to-gray-950 text-white py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.05),transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-lime-400 mb-10">
          Настройки профиля
        </h1>

        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl backdrop-blur-md p-8 flex flex-col gap-7">

          {/* USERNAME */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Person className="text-lime-400" /> Имя пользователя
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Email className="text-lime-400" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Lock className="text-lime-400" /> Новый пароль
            </label>
            <input
              type="password"
              value={password}
              placeholder="Оставьте пустым, чтобы не менять"
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* SAVE */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="
                flex items-center gap-2 bg-lime-400 text-black font-semibold
                px-6 py-3 rounded-xl hover:bg-lime-300 transition
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Save />
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
