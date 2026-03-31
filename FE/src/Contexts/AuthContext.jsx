import { useContext, useState,useEffect } from "react";
import { createContext } from "react";
import PropTypes from 'prop-types';
import axios from "../api/axios";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user on refresh
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/v1/users/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAuth({
          user: res.data.data,
          accessToken: token,
        });
      } catch (err) {
        console.error("Auth restore failed", err);
        localStorage.removeItem("token");
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const setAuthAndPersist = (data) => {
    if (data?.accessToken) {
      localStorage.setItem("token", data.accessToken);
    } else {
      localStorage.removeItem("token");
    }
    setAuth(data);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth: setAuthAndPersist, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);