import { useContext, useState } from "react";
import { createContext } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // ✅ Rehydrate from localStorage on every page load/refresh
    try {
      const token = localStorage.getItem("token");
      if (!token) return {};

      // Decode JWT payload
      const payload = JSON.parse(atob(token.split(".")[1]));

      // ✅ Reject expired tokens
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return {};
      }

      return { token, ...payload };
    } catch {
      localStorage.removeItem("token");
      return {};
    }
  });

  // ✅ Wrap setAuth to also persist token to localStorage
  const setAuthAndPersist = (authData) => {
    if (authData?.token) {
      localStorage.setItem("token", authData.token);
    } else {
      localStorage.removeItem("token"); // logout case
    }
    setAuth(authData);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth: setAuthAndPersist }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  return useContext(AuthContext);
};