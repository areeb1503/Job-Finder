import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AppPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="ml-64 flex-grow p-4 bg-gray-100 sm:ml-0 sm:p-2 md:ml-64">
        <Outlet />
      </div>
    </div>
  );
}


export default AppPage