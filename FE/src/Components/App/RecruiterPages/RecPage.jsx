import React from 'react';
import { Outlet } from 'react-router-dom';
import RecSidebar from './RecSidebar';

function RecPage() {
    return (
        <div className="flex h-screen">
            <RecSidebar/>
            <div className="ml-64 flex-grow p-4 bg-gray-100 sm:ml-0 sm:p-2 md:ml-64">
                <Outlet />
            </div>
        </div>
    )
}

export default RecPage


