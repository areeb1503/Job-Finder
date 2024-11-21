import React from 'react';
import axios from '../../api/axios.js';
import { useAuth } from '../../Contexts/AuthContext';

function useRefreshToken() {
    const { auth, setAuth } = useAuth();

    const refresh = async () => {
        try {
            // Sending request to refresh token endpoint
            const response = await axios.post(
                '/api/v1/users/generate-token',
                {}, // No body needed as refreshToken is in cookies
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true, // To ensure cookies are sent with the request
                }
            );

            setAuth(prev => {
                console.log(JSON.stringify(prev));
                console.log('New Access Token:', response.data.data.accessToken);
                return {
                    ...prev,
                    accessToken: response.data.data.accessToken,
                    user: response.data.data.user,
                };
            });

            return response.data.data.accessToken; // Return new access token
        } catch (error) {
            console.error('Failed to refresh token:', error?.response?.data?.message || error.message);
            throw error; // Re-throw the error for handling in higher-level logic
        }
    };

    return refresh;
}

export default useRefreshToken;
