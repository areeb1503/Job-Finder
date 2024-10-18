import React from 'react'

function Welcome() {
    return (
        <div className="flex h-screen">
            <div className="flex-grow flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-orange-700 mb-4">
                        Welcome to KAAM.
                    </h1>
                    <p className="text-gray-700 text-lg">
                        Your one-stop platform for finding jobs and building resumes.
                    </p>            
                </div>
            </div>
        </div>
    );
}

export default Welcome