import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FileTextOutlined, HeartOutlined, CheckCircleOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';
import { ReactTyped } from "react-typed";

function Jobs() {
  return (
    <div className="grid grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-3 h-screen gap-2 p-0 overflow-hidden">
      {/* Content Div - Display on the Left */}
      <div className="col-span-1 md:col-span-2 md:row-span-2 row-span-9 bg-white p-4 rounded-lg shadow-lg overflow-y-auto h-full flex flex-col">
        {/* Fixed Navigation Div */}
        <nav className="bg-white shadow-lg p-4 mt-0 rounded-lg mx-2 flex-shrink-0">
          <ul className="flex gap-5 md:gap-10 flex-wrap">
            <li>
              <NavLink
                to="/app/recommended"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
                }
              >
                <FileTextOutlined className="mr-2" />
                Recommended
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/app/liked"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
                }
              >
                <HeartOutlined className="mr-2" />
                Liked
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/app/applied"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
                }
              >
                <CheckCircleOutlined className="mr-2" />
                Applied
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Scrollable Outlet Component */}
        <div className="flex-grow overflow-y-auto p-4">
          <Outlet />
        </div>
      </div>

      {/* Chat Div - Display on the Right */}
      <div className="md:row-span-2 col-span-1 bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center space-x-2 p-2 border-b border-gray-300 pb-4">
          <RobotOutlined className="text-orange-700 text-2xl" />
          <span className="text-gray-700 text-lg font-semibold hover:text-orange-700 transition-colors">
            Ask Kaam AI
          </span>
        </div>

        {/* Chat Messages Section */}
        <div className="flex-grow overflow-y-auto p-4 border border-gray-300 rounded-lg bg-gray-50 h-64 shadow-inner flex flex-col justify-between">
          {/* Chat Messages */}
          {/* This section can be populated dynamically with chat content */}
          <div className="flex-grow">
            {/* Dynamically populated chat messages would go here */}
          </div>
          <p className="text-center mb-2 text-gray-600">
            {" "}
            <ReactTyped
              strings={["What can I help you with?"]}
              typeSpeed={100}
              loop
              backSpeed={20}
              cursorChar="|"
              showCursor={true}
            />
          </p>
        </div>


        {/* Input Section */}
        <div className="flex items-center space-x-2 mt-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-grow rounded-full p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-700 transition-shadow"
          />
          <button className="bg-orange-700 text-white rounded-full p-3 hover:bg-orange-600 transition-colors">
            <SendOutlined />
          </button>
        </div>
      </div>

    </div>
  );


}


export default Jobs