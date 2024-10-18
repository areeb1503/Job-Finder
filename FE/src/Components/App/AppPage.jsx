import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AppPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="ml-64 flex-grow p-8 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default AppPage