import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

import RainEffect from "../components/Effects/RainEffect";
import Header from "../components/Header/Header";
import UserAPI from "../app/api/UserApi";

import { useAuth } from "../app/providers/AuthProvider";
import Loader from "../components/Loader/Loader";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth(); // 👈 берём функцию из контекста

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
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const { user, error } = await UserAPI.login(form.username, form.password);

      if (error) {
        toast.error(error);
      } else {
        login(user);

        toast.success(`Добро пожаловать, ${user.username}! 🥛`);
        setTimeout(() => navigate("/profile"), 1500);
      }
    } catch {
      toast.error("Ошибка соединения с сервером 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-black via-gray-900 to-black text-white px-4 sm:px-6">
      <RainEffect />
      <Header show={true} />

      <div className="absolute inset-0 bg-[url('/images/bg-grid.svg')] opacity-10 pointer-events-none"></div>

      <div
        className="relative z-10 w-full max-w-md mx-auto p-6 sm:p-8 md:p-10 bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-[0_0_40px_rgba(163,230,53,0.1)] my-12 sm:my-20 md:my-24"
        data-aos="fade-up"
      >
        <div className="text-center mb-8" data-aos="zoom-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Войти в{" "}
            <span className="text-lime-400 font-momo-trust tracking-wider">
              MilkCord
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Рады видеть тебя снова 👋
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          autoComplete="off"
        >
          <div data-aos="fade-up" data-aos-delay="100">
            <label className="block text-sm text-gray-400 mb-1">Логин</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-lime-400 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm md:text-base"
              placeholder="Введите логин"
            />
          </div>

          <div data-aos="fade-up" data-aos-delay="200" className="relative">
            <label className="block text-sm text-gray-400 mb-1">Пароль</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-12 rounded-lg bg-black/40 border border-gray-700 focus:border-lime-400 outline-none text-white placeholder-gray-500 transition-all duration-200 text-sm md:text-base"
              placeholder="Введите пароль"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-[10%] text-gray-400 hover:text-lime-400 transition-all duration-200"
              tabIndex={-1}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-aos="zoom-in"
            data-aos-delay="300"
            className="mt-4 w-full py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 bg-lime-400/90 text-black hover:bg-lime-500 disabled:bg-lime-400/60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p
          className="text-center text-gray-400 text-sm mt-6"
          data-aos="fade-in"
          data-aos-delay="400"
        >
          Нет аккаунта?{" "}
          <Link
            to="/register"
            className="text-lime-400 hover:text-lime-300 transition-colors"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <div className="absolute w-[500px] h-[500px] bg-lime-400/10 blur-[150px] rounded-full -bottom-32 -right-32"></div>
      <div className="absolute w-[400px] h-[400px] bg-lime-400/5 blur-[200px] rounded-full -top-24 -left-24"></div>

      {loading && <Loader>Вход...</Loader>}
    </div>
  );
}
