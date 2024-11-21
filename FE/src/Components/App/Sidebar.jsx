import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FileTextOutlined,
  SolutionOutlined,
  CommentOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons"; // importing relevant icons from antd
import { Modal, Avatar } from "antd"; // Import Modal from Ant Design
import { UserOutlined } from "@ant-design/icons";
import logo from "../../assets/briefcase.png";
import { useAuth } from "../../Contexts/AuthContext.jsx";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { auth } = useAuth();
  const profile = auth?.user?.profilePhoto;

  // State for controlling popups
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handlers for popups
  const openFeedbackPopup = () => setIsFeedbackOpen(true);
  const closeFeedbackPopup = () => setIsFeedbackOpen(false);

  const openSettingsPopup = () => setIsSettingsOpen(true);
  const closeSettingsPopup = () => setIsSettingsOpen(false);

  return (
    <div className="fixed lg:static">
      <button
        className="fixed top-4 left-4 z-50 text-orange-700 text-2xl md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <CloseOutlined /> : <MenuOutlined />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-40 transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full py-6">
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="flex flex-col items-center">
              <img src={logo} className="h-12 mb-2" alt="Logo" />
              <p className="text-orange-700 font-extrabold">KAAM</p>
            </Link>
          </div>

          <nav className="flex-grow flex flex-col justify-between">
            {/* Top Links */}
            <ul className="flex flex-col font-medium space-y-4">
              <li>
                <NavLink
                  to="/app/jobs"
                  className={({ isActive }) =>
                    `flex items-center px-6 py-3 w-full ${isActive ? "text-orange-700" : "text-gray-700"
                    } hover:bg-gray-100 hover:text-orange-700 duration-200`
                  }
                >
                  <FileTextOutlined className="mr-3" />
                  Jobs
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/app/resume"
                  className={({ isActive }) =>
                    `flex items-center px-6 py-3 w-full ${isActive ? "text-orange-700" : "text-gray-700"
                    } hover:bg-gray-100 hover:text-orange-700 duration-200`
                  }
                >
                  <SolutionOutlined className="mr-3" />
                  Resume
                </NavLink>
              </li>
            </ul>

            {/* Bottom Links */}
            <ul className="flex flex-col font-medium space-y-4 mt-auto">
              <li>
                <button
                  onClick={openFeedbackPopup}
                  className="flex items-center px-6 py-3 w-full text-gray-700 hover:bg-gray-100 hover:text-orange-700 duration-200"
                >
                  <CommentOutlined className="mr-3" />
                  Feedback
                </button>
              </li>
              <li>
                <button
                  onClick={openSettingsPopup}
                  className="flex items-center px-6 py-3 w-full text-gray-700 hover:bg-gray-100 hover:text-orange-700 duration-200"
                >
                  <SettingOutlined className="mr-3" />
                  Settings
                </button>
              </li>
            </ul>
          </nav>

          {/* Avatar at the bottom with modern styling */}
          <div className="flex justify-center mt-6 mb-4">
            <Avatar
              size={48}
              src={profile ? profile : undefined} // Use profile image if available, otherwise undefined
              icon={profile ? null : <UserOutlined />} // Show icon if no profile is provided
              className="border-2 border-orange-700 shadow-lg rounded-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-orange-500"
            />
          </div>
        </div>
      </aside>
      {/* Feedback Modal */}
      <Modal
        title={
          <h2 className="text-orange-700 text-lg font-semibold">Feedback</h2>
        }
        visible={isFeedbackOpen}
        onCancel={closeFeedbackPopup}
        footer={null}
        style={{
          borderRadius: '8px',
        }}
        closable={true}
        closeIcon={<CloseOutlined className="text-orange-700" />}
      >
        <p>Here you can submit your feedback.</p>
        {/* Add feedback form or content here */}
      </Modal>

      {/* Settings Modal */}
      <Modal
        title={
          <h2 className="text-orange-700 text-lg font-semibold">Settings</h2>
        }
        visible={isSettingsOpen}
        onCancel={closeSettingsPopup}
        footer={null}
        style={{
          borderRadius: '8px',
        }}
        closable={true}
        closeIcon={<CloseOutlined className="text-orange-700" />}
      >
        <p>Adjust your account settings here.</p>
        {/* Add settings form or content here */}
      </Modal>


    </div>
  );
};

export default Sidebar;
