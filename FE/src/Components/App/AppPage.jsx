import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AppPage() {
  return (
    <div>
      <Sidebar/>
      <Outlet/>
    </div>
  )
}

export default AppPage