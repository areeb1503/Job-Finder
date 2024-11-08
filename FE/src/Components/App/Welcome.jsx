import React from 'react';
import { useAuth } from '../../Contexts/AuthContext.jsx';

function Welcome() {
    const { auth } = useAuth();
    const name = auth?.user?.fullname.split(' ')[0];
    return (
        <div className="flex h-screen">
            <div className="flex-grow flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-orange-700 mb-4">
                         {name}, welcome to KAAM!
                    </h1>
                    <p className="text-gray-700 text-lg">
                        Your one-stop platform for finding jobs.
                    </p>            
                </div>
            </div>
        </div>
    );
}

export default Welcome