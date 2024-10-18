import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FileTextOutlined, HeartOutlined, CheckCircleOutlined, SendOutlined, RobotOutlined } from '@ant-design/icons';


function Jobs() {
  return (
    <div className="flex flex-col h-screen p-0 gap-2 overflow-hidden"> {/* Added overflow-hidden to prevent scrolling */}
      {/* Navigation Div */}
      <nav className="bg-white shadow-lg p-4 mt-0 rounded-lg mx-2"> {/* Adjusted margin to mx-2 */}
        <ul className="flex gap-10"> {/* Adjusted gap between NavLinks */}
          <li>
            <NavLink
              to="/app/recommended"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:text-orange-700 hover:bg-gray-100 duration-200`
              }
            >
              <FileTextOutlined className="mr-2" /> {/* Added icon */}
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
              <HeartOutlined className="mr-2" /> {/* Added icon */}
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
              <CheckCircleOutlined className="mr-2" /> {/* Added icon */}
              Applied
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-grow mb-4 gap-5"> {/* Reduced gap between divs */}
        {/* Bottom Left Div - Outlet Component */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-lg overflow-y-auto h-full"> {/* Added overflow-y-auto and h-full */}
          <Outlet />
        </div>

        {/* Bottom Right Div - AI Chatbot */}
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between ">
          <div className="flex flex-col space-y-2 h-full p-2"> {/* Reduced space-y between child elements */}
            {/* Chat Messages Section */}
            <span className="text-gray-700 text-lg hover:text-orange-700"><RobotOutlined /> Ask KaamBot</span>
            <div className="flex-grow overflow-y-auto p-4 border-gray-700 border rounded-lg h-64"> {/* Added overflow-y-auto and a fixed height */}
              {/* Chat Messages here */}
            </div>

            {/* Input Section */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow rounded-md p-2 border-gray-700 border"
              />
              <button className="bg-orange-700 text-white rounded-lg hover:bg-orange-600 p-2">
                <SendOutlined /> {/* Replaced Send button with Send icon */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


};


export default Jobs