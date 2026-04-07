import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Cookies from 'universal-cookie';
import { useAuth } from '../../Contexts/AuthContext.jsx';
import axios from '../../api/axios.js';
import logo from '../../assets/briefcase.png';
import Loader from '../Utils/Loader.jsx';

const cookies = new Cookies();
const LOGIN_URL = '/api/v1/users/login';

const Login = () => {
  const { setAuth } = useAuth();
  const emailRef = useRef();
  const errRef = useRef();
  const [loading, setLoading] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [formData.email, formData.password]);

  useEffect(() => {
    setLoading(false);
  }, [formData.email, formData.password]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    const { email, password } = formData;

    const response = await axios.post(
      LOGIN_URL,
      JSON.stringify({ email, password }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const user = response.data.data.user;
    const accessToken = response.data.data.accessToken;
     localStorage.setItem("accessToken", accessToken);

    setAuth({ user, accessToken });

    setSuccess(true);
    setFormData({ email: "", password: "" });

    if (user.role === "recruiter") {
      navigate("/recruiter/");
    } else {
      navigate("/app/");
    }

  } catch (error) {
    if (!error.response) { 
      setErrMsg("No Server Response");
    } else if (error.response.data.statusCode === 400) {
      setErrMsg("Missing Username or Password");
    } else if (error.response.data.statusCode === 401) {
      setErrMsg("Invalid credentials");
    } else if (error.response.data.statusCode === 404) {
      setErrMsg("User does not exist");
    } else {
      setErrMsg("Login Failed");
    }
    errRef.current.focus();
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50 px-6 sm:px-8 md:px-12">
      {/* Left Job Search SVG */}
      <img
        src="https://www.svgrepo.com/show/290023/job-search.svg"
        alt="Job Search Left"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-32 h-32 opacity-30 text-orange-700 ml-4 sm:ml-8 lg:ml-16 hidden sm:block"
      />

      {/* Right Business Job Search SVG */}
      <img
        src="https://www.svgrepo.com/show/122266/business-job-search-symbol.svg"
        alt="Business Job Search Right"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 h-32 opacity-30 text-orange-700 mr-4 sm:mr-8 lg:mr-16 hidden sm:block"
      />

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-6 relative z-10">
        <div className="relative flex justify-center">
          <h2 className="text-2xl font-bold text-center text-orange-700">Log In</h2>
        </div>

        {errMsg && (
          <p
            ref={errRef}
            className="flex items-center gap-2 text-red-600 font-semibold"
            aria-live="assertive"
          >
            <ExclamationCircleOutlined className="text-red-600" />
            {errMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              ref={emailRef}
              autoComplete="on"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-orange-700 transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-orange-700 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-2 bg-orange-700 text-white rounded-md hover:bg-white hover:text-orange-700 border border-orange-700 transition-all duration-300 ease-out focus:ring-2 focus:ring-orange-700"
          >
            {loading ? <Loader /> : 'Log In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-orange-700 hover:text-gray-600 transition">
              Sign Up
            </Link>
          </p>
        </div>

        <footer className="mt-8 text-center text-gray-600 space-y-2">
          <div className="flex justify-center space-x-8">
            <Link to="/" className="hover:text-gray-600 hover:underline transition-all duration-200">
              Home
            </Link>
            <Link to="/about" className="hover:text-gray-600 hover:underline transition-all duration-200">
              About
            </Link>
          </div>
          <div className="flex justify-center items-center space-x-2">
            <img src={logo} alt="KAAM Logo" className="h-12" />
            <p className="text-orange-700 font-extrabold text-lg">KAAM</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
