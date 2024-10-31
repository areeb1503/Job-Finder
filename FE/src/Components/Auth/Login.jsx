import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Cookies from 'universal-cookie';
import { useAuth } from '../../Contexts/AuthContext.jsx';
import axios from '../../api/axios.js';
import { ClipLoader } from 'react-spinners';

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

  useEffect(()=>{
    setLoading(false)
  },[formData.email, formData.password])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { email, password } = formData;
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email, password }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      console.log(response.data);
      if (!response.data){
        setLoading(true);
      }
      const accessToken = response.data?.data?.accessToken;
      console.log("accessToken :",accessToken);
      setAuth({ email, accessToken });
      setSuccess(true);
      setFormData({
        email: '',
        password: '',
      });
      navigate('/app/');

      if (response.data?.data?.user.role === 'recruiter'){
        navigate('/recruiter/')
      }
    } catch (error) {
      if (!error?.response) {
        setErrMsg('No Server Response');
      } else if (error.response?.status === 400) {
        setErrMsg('Missing Username or Password');
      } else if (error.response?.status === 401) {
        setErrMsg('Unauthorized');
      } else {
        setErrMsg('Login Failed');
      }
      errRef.current.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-orange-700">Log In</h2>

        <p
          ref={errRef}
          className={`${errMsg ? 'flex items-center gap-2 text-red-600 font-semibold' : 'hidden'}`}
          aria-live="assertive"
        >
          {errMsg && <ExclamationCircleOutlined className="text-red-600" />}
          {errMsg}
        </p>

        <div className="flex flex-col gap-4 ">
          <div>
            <label htmlFor='email' className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              id='email'
              ref={emailRef}
              autoComplete='on'
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
            />
          </div>

          <div>
            <label htmlFor='password' className="block text-gray-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id='password'
                value={formData.password}
                onChange={handleChange}
                required
                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
            <ClipLoader color='#c2410c' loading={loading} size={30}/>
          </button>
        </div>
      </form>
      <h1 className='text-orange-700 font-bold'>OR</h1>
      <div className='bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <p>Don't have an account? <Link to="/signup" className='font-semibold text-orange-700 hover:text-gray-600'>Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;
