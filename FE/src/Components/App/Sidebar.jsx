import { Link, NavLink } from 'react-router-dom';
import { FileTextOutlined, SolutionOutlined, CommentOutlined, SettingOutlined } from '@ant-design/icons'; // importing relevant icons from antd
import logo from '../../assets/briefcase.png';
import { useAuth } from '../../Contexts/AuthContext.jsx';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const Sidebar = () => {
  const { auth } = useAuth();
  const profile = auth?.user?.profilePhoto;

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 shadow-lg z-50 bg-white border-r border-gray-200">
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
                  `flex items-center px-6 py-3 w-full ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:bg-gray-100 hover:text-orange-700 duration-200`
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
                  `flex items-center px-6 py-3 w-full ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:bg-gray-100 hover:text-orange-700 duration-200`
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
              <NavLink
                to="/app/feedback"
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 w-full ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:bg-gray-100 hover:text-orange-700 duration-200`
                }
              >
                <CommentOutlined className="mr-3" />
                Feedback
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/app/settings"
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 w-full ${isActive ? 'text-orange-700' : 'text-gray-700'} hover:bg-gray-100 hover:text-orange-700 duration-200`
                }
              >
                <SettingOutlined className="mr-3" />
                Settings
              </NavLink>
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

  );
};



export default Sidebar;
