import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Close } from "@mui/icons-material";
import { useAuth } from "../../app/providers/AuthProvider";

export default function AuthenticatedHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { path: "/profile", label: "Профиль" },
    { path: "/messenger", label: "Мессенджер" },
    { path: "/music", label: "Музыка" },
    { path: "/settings", label: "Настройки" },
  ];

  return (
    <header
      className={`
        top-0 left-0 w-full z-50
        bg-gray-950 backdrop-blur-xl
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* === ЛОГО === */}
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

        {/* === НАВИГАЦИЯ === */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-gray-300 hover:text-lime-400 transition duration-200 font-medium tracking-wide ${
                  isActive ? "text-lime-400" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* === КНОПКИ === */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden lg:inline-flex px-5 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
              >
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden lg:inline-flex px-5 py-2 rounded-lg border border-lime-400 text-lime-300 font-semibold hover:bg-lime-400 hover:text-black transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:inline-flex px-5 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="hidden md:inline-flex px-5 py-2 rounded-lg border border-lime-400 text-lime-300 font-semibold hover:bg-lime-400 hover:text-black transition"
              >
                Регистрация
              </Link>
            </>
          )}

          {/* === Мобильное меню === */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-lime-400 hover:text-lime-300 transition"
          >
            {menuOpen ? <Close fontSize="large" /> : <Menu fontSize="large" />}
          </button>
        </div>
      </div>

      {/* === МОБИЛЬНОЕ МЕНЮ === */}
      {menuOpen && (
        <div className="md:hidden bg-black/90 border-t border-lime-400/10 backdrop-blur-xl animate-fadeIn">
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

            <div className="flex flex-col gap-3 mt-6 w-11/12 max-w-xs">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center px-6 py-3 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition text-base"
                  >
                    {user.username}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-center px-6 py-3 rounded-lg border border-lime-400 text-lime-300 font-semibold hover:bg-lime-400 hover:text-black transition text-base"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center px-6 py-3 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition text-base"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center px-6 py-3 rounded-lg border border-lime-400 text-lime-300 font-semibold hover:bg-lime-400 hover:text-black transition text-base"
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
