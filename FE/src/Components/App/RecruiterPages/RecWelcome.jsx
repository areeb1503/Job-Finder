import React from 'react'

function RecWelcome() {
    return (
        <div className="flex h-screen">
            <div className="flex-grow flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-orange-700 mb-4">
                        Welcome, Recruiter!
                    </h1>
                    <p className="text-gray-700 text-lg mb-6">
                        KAAM is here to help you find the best candidates for your jobs.
                    </p>
                    <p className="text-gray-700">
                        Post job openings, and connect with top talent.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RecWelcome