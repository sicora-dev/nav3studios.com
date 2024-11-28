// /src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mover la lógica de autenticación de Navbar.js aquí
  const checkAuth = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/check-auth`,
        { withCredentials: true },
      );
      setIsAuthenticated(response.status === 200);
      setUser(response.data.user);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
