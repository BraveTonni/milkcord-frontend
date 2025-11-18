import { createContext, useContext, useEffect, useState } from "react";
import UserAPI from "../api/UserApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем текущего пользователя при старте
  useEffect(() => {
    const initUser = async () => {
      const res = await UserAPI.getCurrentUser();
      if (res?.user) setUser(res.user);
      setLoading(false);
    };
    initUser();
  }, []);

  const login = (user) => setUser(user);
  const logout = () => {
    UserAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
