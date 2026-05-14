import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(res => { setUser(res.data.data); localStorage.setItem("user", JSON.stringify(res.data.data)); })
      .catch(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res  = await authAPI.login({ email, password });
    const { accessToken, user: u } = res.data.data;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);