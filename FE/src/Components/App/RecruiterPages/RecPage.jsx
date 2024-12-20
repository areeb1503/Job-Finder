import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import RecSidebar from "./RecSidebar";

function RecPage(){
  const [isOpen, setIsOpen] = useState(false);

  // Toggle the sidebar
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="flex h-screen">
      <RecSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar} // Close sidebar on clicking outside
        ></div>
      )}

      {/* Main Content */}
      <div
        className={`flex-grow p-4 bg-gray-100 transition-all duration-300 ${
          !isOpen && "md:ml-64" // Only push content for larger screens
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default RecPage;
