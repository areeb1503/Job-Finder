import { axiosPrivate } from '../../api/axios';
import { useEffect } from 'react';
import useRefreshToken from './useRefreshToken';
import { useAuth } from '../../Contexts/AuthContext';



const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    // ✅ REQUEST INTERCEPTOR
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        // 🔥 ALWAYS attach latest token
        if (auth?.accessToken) {
          config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ RESPONSE INTERCEPTOR
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        // 🔥 FIX: use 401 instead of 403
        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true;

          try {
            const newAccessToken = await refresh();

            // ✅ attach new token
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

            // ✅ retry original request
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // 🔥 Optional: force logout
            window.location.href = "/login";

            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // ✅ CLEANUP
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;