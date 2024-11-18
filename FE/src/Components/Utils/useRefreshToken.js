import React from 'react'
import axios from '../../api/axios.js';
import { useAuth } from '../../Contexts/AuthContext';

function useRefreshToken() {
    const { auth, setAuth } = useAuth();
    const { refreshToken } = auth;

    const refresh = async () => {
        try {
            const response = await axios.post('/api/v1/users/generate-token', JSON.stringify({ refreshToken }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });

            setAuth(prev => {
                console.log(JSON.stringify(prev));
                console.log(response.data.accessToken);
                return { ...prev, accessToken: response.data.accessToken, user: response.data.user }
            })
            return response.data.accessToken;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            
        }
    }

    return refresh;
}

export default useRefreshToken;