import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import RainEffect from "../components/Effects/RainEffect";
import Header from "../components/Header/Header";
import { toast } from "react-toastify";
import UserAPI from "../app/api/UserApi";

import { useAuth } from "../app/providers/AuthProvider";
import Loader from "../components/Loader/Loader";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // 👈 берём login() из контекста

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
      offset: 100,
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (form.password !== form.confirm_password) {
      toast.error("Пароли не совпадают ⚠️");
      return;
    }

    setLoading(true);
    try {
      const res = await UserAPI.register(
        form.username,
        form.email,
        form.password,
        form.confirm_password
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        // ✅ Обновляем глобальный контекст (чтобы Header знал, что юзер вошёл)
        login(res.user);

        toast.success(`Добро пожаловать, ${res.user.username}! 🥛`);
        setTimeout(() => navigate("/profile"), 1500);
      }
    } catch (err) {
      console.error("Ошибка регистрации:", err);
      toast.error("Ошибка соединения с сервером 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-black via-gray-900 to-black text-white px-4 sm:px-6">
      <RainEffect />
      <Header show={true} />

      {/* Слегка подсвеченный фон */}
      <div className="absolute inset-0 bg-[url('/images/bg-grid.svg')] opacity-10 pointer-events-none"></div>

      {/* Карточка формы */}
      <div
        className="relative z-10 w-full max-w-md mx-auto p-6 sm:p-8 md:p-10 bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_0_40px_rgba(163,230,53,0.1)] my-12 sm:my-20 md:my-24"
        data-aos="fade-up"
      >
        <div className="text-center mb-8" data-aos="zoom-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Присоединяйся к{" "}
            <span className="text-lime-400 font-momo-trust tracking-wider">
              MilkCord
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Создай аккаунт и стань частью сообщества
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div data-aos="fade-up" data-aos-delay="100">
            <label className="block text-sm text-gray-400 mb-1">
              Имя пользователя
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-lime-400 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm md:text-base"
              placeholder="Введите имя"
            />
          </div>

          <div data-aos="fade-up" data-aos-delay="200">
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-lime-400 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm md:text-base"
              placeholder="Введите email"
            />
          </div>

          <div data-aos="fade-up" data-aos-delay="300">
            <label className="block text-sm text-gray-400 mb-1">Пароль</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-lime-400 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm md:text-base"
              placeholder="Введите пароль"
            />
          </div>

          <div data-aos="fade-up" data-aos-delay="350">
            <label className="block text-sm text-gray-400 mb-1">
              Подтверждение пароля
            </label>
            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-lime-400 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm md:text-base"
              placeholder="Повторите пароль"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-aos="zoom-in"
            data-aos-delay="400"
            className="mt-4 w-full py-3 rounded-lg bg-lime-400/90 text-black font-semibold hover:bg-lime-500 transition-all duration-300 shadow-[0_0_15px_rgba(163,230,53,0.6)] hover:shadow-[0_0_25px_rgba(163,230,53,0.9)] text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
          </button>
        </form>

        <p
          className="text-center text-gray-400 text-sm mt-6"
          data-aos="fade-in"
          data-aos-delay="500"
        >
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="text-lime-400 hover:text-lime-300 transition-colors"
          >
            Войти
          </Link>
        </p>
      </div>

      {/* Световые пятна */}
      <div className="absolute w-[500px] h-[500px] bg-lime-400/10 blur-[150px] rounded-full -bottom-32 -right-32"></div>
      <div className="absolute w-[400px] h-[400px] bg-lime-400/5 blur-[200px] rounded-full -top-24 -left-24"></div>

      {loading && <Loader>Регистрация...</Loader>}
    </div>
  );
}
