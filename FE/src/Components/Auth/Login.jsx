import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',

  });
  const handleSubmit = (e) => {
    e.preventDefault();
    // Send data to backend
    console.log(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target; // Destructuring name, value and files from e.target
    setFormData({ ...formData, [name]: value });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-orange-700">Log In</h2>

        <div className="flex flex-col gap-4 ">
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
          <button
            type="submit"
            className="border border-orange-700 bg-orange-700 text-white px-5 py-2 rounded-md transition-colors duration-300 ease-out hover:bg-white hover:text-orange-700 hover:border-orange-700 mt-4 sm:col-span-2"
          >
            Log In
          </button>
        </div>
      </form>
      <h1 className='text-orange-700 font-bold'>OR</h1>
      <div className='bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <p>Don't have an account?<Link to="/signup" className='font-semibold text-orange-700 hover:text-gray-600'>Sign Up</Link></p>
      </div>
    </div>
  );
};


export default Login