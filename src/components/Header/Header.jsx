import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useAuth } from "../../app/providers/AuthProvider";

export default function Header({ show = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout()
    navigate("/");
  };

  const navLinks = [{ path: "/", label: "Главная" }];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50
        bg-gray-950/60 backdrop-blur-xl border-b border-white/10
        shadow-[0_4px_30px_rgba(0,0,0,0.2)]
        transition-transform duration-500 ease-in-out
        ${show ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Логотип */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lime-400 font-momo-trust text-2xl tracking-wide"
        >
          <img
            src="/images/logo.png"
            alt="MilkCord Logo"
            className="w-8 h-8 object-contain"
          />
          MilkCord
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex gap-8 text-gray-100 font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors duration-200 hover:text-lime-400 ${
                  isActive ? "text-lime-400" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Кнопки */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden md:inline-flex px-4 py-2 rounded-lg bg-lime-500 text-black font-semibold hover:bg-lime-400 transition"
              >
                Профиль
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex px-4 py-2 rounded-lg border border-lime-500 text-lime-400 font-semibold hover:bg-lime-500 hover:text-black transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:inline-flex px-4 py-2 rounded-lg bg-lime-500 text-black font-semibold hover:bg-lime-400 transition"
              >
                Войти
              </Link>

              <Link
                to="/register"
                className="hidden md:inline-flex px-4 py-2 rounded-lg border border-lime-500 text-lime-400 font-semibold hover:bg-lime-500 hover:text-black transition"
              >
                Регистрация
              </Link>
            </>
          )}

          {/* Мобильное меню */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white hover:text-lime-400 transition"
          >
            {menuOpen ? (
              <CloseIcon fontSize="large" />
            ) : (
              <MenuIcon fontSize="large" />
            )}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="md:hidden bg-gray-950/90 backdrop-blur-xl border-t border-white/10 shadow-lg transition-all animate-fadeIn">
          <nav className="flex flex-col items-center py-8 gap-5 text-gray-100 font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-lg transition-colors duration-200 hover:text-lime-400 ${
                    isActive ? "text-lime-400" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Кнопки в мобильном меню */}
            <div className="flex flex-col gap-3 mt-6 w-11/12 max-w-xs">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center px-6 py-3 rounded-lg bg-lime-500 text-black font-semibold hover:bg-lime-400 transition text-base"
                  >
                    Профиль
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-center px-6 py-3 rounded-lg border border-lime-500 text-lime-400 font-semibold hover:bg-lime-500 hover:text-black transition text-base"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center px-6 py-3 rounded-lg bg-lime-500 text-black font-semibold hover:bg-lime-400 transition text-base shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center px-6 py-3 rounded-lg border border-lime-500 text-lime-400 font-semibold hover:bg-lime-500 hover:text-black transition text-base"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
