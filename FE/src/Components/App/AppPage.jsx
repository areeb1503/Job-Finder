// import React, { useState } from 'react';
// import Sidebar from './Sidebar';
// import { Outlet } from 'react-router-dom';


// function AppPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       {/* Main Content */}
//       <div
//         className={`flex-grow p-4 bg-gray-100 transition-all duration-300 ${
//           isSidebarOpen ? 'ml-64' : 'ml-0'
//         }`}
//       >
//         <Outlet />
//       </div>
//     </div>
//   );
// }

// export default AppPage;

// old code 
import React,{useState} from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

function AppPage() {
    const [isOpen, setIsOpen] = useState(false);
  
    // Toggle the sidebar
    const toggleSidebar = () => setIsOpen((prev) => !prev);
  
  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
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


export default AppPage