import React, { useState } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'; 

const SignUp = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'student',
        bio: '',
        resume: null,
        resumeOriginalName: '',
        profilePhoto: null,
        profilePhotoOriginalName: ''
    });

    const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

    const handleChange = (e) => {
        const { name, value, files } = e.target; // Destructuring name, value and files from e.target
        if (name === 'resume' || name === 'profilePhoto') {
            setFormData({ ...formData, [name]: files[0], [`${name}OriginalName`]: files[0].name });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleUpload = (name, file) => {
        setFormData({ ...formData, [name]: file, [`${name}OriginalName`]: file.name });
        return false; // Prevent automatic upload
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Send data to backend
        console.log(formData);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-4 text-orange-700">Sign Up</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                {showPassword ? (
                                    <EyeInvisibleOutlined className="text-gray-500" />
                                ) : (
                                    <EyeOutlined className="text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                        >
                            <option value="student">Student</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-gray-700 font-semibold mb-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Resume</label>
                        <Upload
                            accept=".pdf"
                            beforeUpload={(file) => handleUpload('resume', file)}
                            showUploadList={true}
                        >
                            <Button icon={<UploadOutlined />} className="border border-orange-700 text-orange-700 w-full">
                                Upload Resume
                            </Button>
                        </Upload>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Profile Photo</label>
                        <Upload
                            accept="image/*"
                            beforeUpload={(file) => handleUpload('profilePhoto', file)}
                            showUploadList={true}
                        >
                            <Button icon={<UploadOutlined />} className="border border-orange-700 text-orange-700 w-full ">
                                Upload Profile Photo
                            </Button>
                        </Upload>
                    </div>

                    <button
                        type="submit"
                        className="border border-orange-700 bg-orange-700 text-white px-5 py-2 rounded-md transition-colors duration-300 ease-out hover:bg-white hover:text-orange-700 hover:border-orange-700 mt-4 sm:col-span-2"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
            <h1 className='text-orange-700 font-bold'>OR</h1>
            <div className='bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <p>Already have an account?<Link to="/login" className='font-semibold text-orange-700 hover:text-gray-600'>Log In</Link></p>
            </div>
        </div>
    );
};

export default SignUp;
