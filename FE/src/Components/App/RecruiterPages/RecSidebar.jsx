import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    FileTextOutlined,
    SolutionOutlined,
    CommentOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { Modal, Avatar, Rate, Button, Input, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import logo from "../../../assets/briefcase.png";
import { useAuth } from "../../../Contexts/AuthContext.jsx";
import axios from "../../../api/axios.js";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { auth, setAuth } = useAuth();
    const profile = auth?.user?.profilePhoto;
    const { user, accessToken } = auth;

    // State for modals
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Modal handlers
    const openFeedbackPopup = () => setIsFeedbackOpen(true);
    const closeFeedbackPopup = () => setIsFeedbackOpen(false);

    // Logout handler
    const handleLogout = async () => {
        try {
            await axios.post(
                "/api/v1/users/logout",
                { user },
                { withCredentials: true }
            );
            setAuth({});
            message.success("Logged out successfully!");
            navigate("/");
        } catch (error) {
            message.error("Logout failed. Please try again.");
            console.error("Logout error:", error);
        }
    };

    // Feedback submit handler
    const handleSubmitFeedback = async () => {
        if (!feedbackText || rating === 0) {
            message.error("Please complete all fields before submitting.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                "/api/v1/feedback/add-feedback",
                { feedbackText, rating },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            message.success("Feedback submitted successfully!");
            setFeedbackText("");
            setRating(0);
            closeFeedbackPopup();
        } catch (error) {
            message.error("Failed to submit feedback.");
            console.error("Feedback submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div >
            {/* Sidebar Toggle Button */}
            <button
                className="fixed top-4 left-4 z-50 text-orange-700 text-2xl md:hidden"
                onClick={toggleSidebar}
            >
                {isOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0`}
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
                                    to="/recruiter/uploadjobs"
                                    className={({ isActive }) =>
                                        `flex items-center px-6 py-3 w-full ${isActive ? "text-orange-700" : "text-gray-700"
                                        } hover:bg-gray-100 hover:text-orange-700 duration-200`
                                    }
                                >
                                    <FileTextOutlined className="mr-3" />
                                    Upload Jobs
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/recruiter/yourjobs"
                                    className={({ isActive }) =>
                                        `flex items-center px-6 py-3 w-full ${isActive ? "text-orange-700" : "text-gray-700"
                                        } hover:bg-gray-100 hover:text-orange-700 duration-200`
                                    }
                                >
                                    <SolutionOutlined className="mr-3" />
                                    Your Jobs
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
                                    onClick={handleLogout}
                                    className="flex items-center px-6 py-3 w-full text-gray-700 hover:bg-gray-100 hover:text-orange-700 duration-200"
                                >
                                    <LogoutOutlined className="mr-3" />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Avatar */}
                    <div className="flex justify-center mt-6 mb-4">
                        <Avatar
                            size={48}
                            src={profile || undefined}
                            icon={!profile && <UserOutlined />}
                            className="border-2 border-orange-700 shadow-lg rounded-full transition-all duration-300 ease-in-out hover:shadow-xl hover:border-orange-500"
                        />
                    </div>
                </div>
            </aside>

            {/* Feedback Modal */}
            <Modal
                title={<h2 className="text-orange-700 text-lg font-semibold">Feedback</h2>}
                visible={isFeedbackOpen}
                onCancel={closeFeedbackPopup}
                footer={null}
                style={{
                    borderRadius: "8px",
                }}
                closable={true}
                closeIcon={<CloseOutlined className="text-orange-700" />}
            >
                <div className="max-w-md w-full p-6 bg-white shadow-md rounded-md mx-auto">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-orange-700">
                            Please consider giving your Feedback here.
                        </h1>
                        <p className="text-sm text-gray-600">
                            Your feedback helps us make a better product.
                        </p>
                    </div>
                    <form className="flex flex-col gap-4">
                        <div>
                            <label className="block text-orange-700 font-medium mb-1">
                                Feedback<span className="text-red-700">*</span>
                            </label>
                            <Input.TextArea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                rows={3}
                                placeholder="Write your feedback here"
                                className="border border-orange-700 focus:ring focus:ring-orange-300 rounded-md"
                                maxLength={300}
                            />
                        </div>
                        <div>
                            <label className="block text-orange-700 font-medium mb-1">
                                Rating<span className="text-red-700">*</span>
                            </label>
                            <Rate
                                value={rating}
                                onChange={(value) => {
                                    setRating(value);
                                    console.log("Selected rating:", value);
                                }}
                                className="text-orange-700"
                            />
                        </div>
                        <Button
                            type="primary"
                            loading={loading}
                            onClick={handleSubmitFeedback}
                            className="bg-orange-700 hover:bg-orange-800 border-none py-2 px-4 rounded-md text-white w-full"
                        >
                            Submit
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Sidebar;
