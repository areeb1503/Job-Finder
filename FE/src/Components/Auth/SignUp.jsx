import React, { useRef, useState, useEffect } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Cookies from 'universal-cookie';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from '../../api/axios.js';
import { useAuth } from '../../Contexts/AuthContext.jsx';
import logo from '../../assets/briefcase.png';



const cookies = new Cookies();

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[1@#$%]).{8,24}$/;
const REGISTER_URL = '/api/v1/users/register';

const SignUp = () => {
    const navigate = useNavigate();
    const fullnameRef = useRef();
    const errRef = useRef();

    const { setAuth } = useAuth();

    const [fullnameFocus, setFullnameFocus] = useState(false);

    const [validPassword, setValidPassword] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPassword, setMatchPassword] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'recruiter',
        company: '',
        resume: null,
        profilePhoto: null,
    });

    useEffect(() => {
        fullnameRef.current.focus();
    }, []);

    useEffect(() => {
        const result = PWD_REGEX.test(formData.password);
        setValidPassword(result);
        const match = formData.password === matchPassword;
        setValidMatch(match);
    }, [formData.password, matchPassword]);

    useEffect(() => {
        setErrMsg('');
    }, [formData, matchPassword]);

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'resume' || name === 'profilePhoto') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleUpload = (name, file) => {
        setFormData({ ...formData, [name]: file });
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password before proceeding
        if (!PWD_REGEX.test(formData.password)) {
            setErrMsg("Invalid Credentials");
            return;
        }

        try {
            const formDataToSubmit = new FormData();
            for (const [key, value] of Object.entries(formData)) {
                if (key === 'resume' || key === 'profilePhoto') {
                    if (value) formDataToSubmit.append(key, value);
                } else {
                    formDataToSubmit.append(key, value);
                }
            }

            const response = await axios.post(REGISTER_URL, formDataToSubmit, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            const resObject = response.data;
            const accessToken = resObject.data?.accessToken;
            const user = resObject.data?.user;

            setAuth({ user, accessToken });

            if (user.role === 'recruiter') {
                navigate('/recruiter/');
            } else {
                navigate('/app/');
            }

            setSuccess(true);
            setFormData({
                fullname: '',
                email: '',
                phoneNumber: '',
                password: '',
                role: 'recruiter',
                company: '',
                resume: null,
                profilePhoto: null,
            });
            setMatchPassword('');

        } catch (error) {
            console.error("Error during registration:", error); // Log error for debugging
            if (!error.response) {
                setErrMsg('No Server Response, try again later');
            } else if (error.response.data.statusCode === 400) {
                setErrMsg('User already exists');
            } else {
                setErrMsg('Registration Failed');
            }
            errRef.current.focus();
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 sm:px-8 md:px-12">
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
            <form onSubmit={handleSubmit} className="bg-white m-4 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-4 text-orange-700">Sign Up</h2>

                {errMsg && (
                    <p ref={errRef} className="flex items-center gap-2 text-red-600 font-semibold" aria-live="assertive">
                        <ExclamationCircleOutlined className="text-red-600" />
                        {errMsg}
                    </p>
                )}


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            ref={fullnameRef}
                            onFocus={() => setFullnameFocus(true)}
                            onBlur={() => setFullnameFocus(false)}
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
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">
                            Password
                            <span className={validPassword ? "text-green-600 ml-2" : "hidden"}>
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                            <span className={validPassword || !formData.password ? "hidden" : "text-red-600 ml-2"}>
                                <FontAwesomeIcon icon={faTimes} />
                            </span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                aria-invalid={validPassword ? "false" : "true"}
                                aria-describedby="pwdnote"
                                onFocus={() => setPwdFocus(true)}
                                onBlur={() => setPwdFocus(false)}
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
                        <p
                            id="pwdnote"
                            className={pwdFocus && !validPassword ? "text-gray-600 text-sm mt-2 bg-gray-100 p-2 rounded-md" : "hidden"}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            8 to 24 characters. <br />
                            Must include uppercase and lowercase letters, a number, and a special character. <br />
                            Allowed Special Characters: <span aria-label="exclamation mark">!</span>
                            <span aria-label="at symbol">@</span>
                            <span aria-label="hashtag">#</span>
                            <span aria-label="dollar sign">$</span>
                            <span aria-label="percent">%</span>
                        </p>
                    </div>


                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">
                            Confirm Password
                            <span className={validMatch && matchPassword ? "text-green-600 ml-2" : "hidden"}>
                                <FontAwesomeIcon icon={faCheck} />
                            </span>
                            <span className={validMatch || !matchPassword ? "hidden" : "text-red-600 ml-2"}>
                                <FontAwesomeIcon icon={faTimes} />
                            </span>
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={matchPassword}
                                aria-invalid={validMatch ? "false" : "true"}
                                aria-describedby='confirmnote'
                                onChange={(e) => setMatchPassword(e.target.value)}
                                onFocus={() => setMatchFocus(true)}
                                onBlur={() => setMatchFocus(false)}
                                required
                                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                            />
                        </div>
                        <p
                            id="confirmnote"
                            className={matchFocus && !validMatch ? "text-gray-600 text-sm mt-2 bg-gray-100 p-2 rounded-md" : "hidden"}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            Must match the first password input field.
                        </p>
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
                            <option value="student">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>

                    {formData.role === 'recruiter' && (
                        <div className="col-span-1 sm:col-span-2">
                            <label className="block text-gray-700 font-semibold mb-1">Company</label>
                            <input
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                rows="3"
                                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:border-orange-700 focus:ring-1 focus:ring-orange-700"
                            />
                        </div>
                    )}

                    {/* Conditionally render the resume upload field */}
                    {formData.role === 'student' && (
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">Resume</label>
                            <Upload
                                accept=".pdf"
                                beforeUpload={(file) => handleUpload('resume', file)}
                                showUploadList={true}
                                required
                            >
                                <Button icon={<UploadOutlined />} className="border border-orange-700 text-orange-700 w-full">
                                    Upload Resume
                                </Button>
                            </Upload>
                        </div>
                    )}

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
                        disabled={!validMatch || !validPassword}
                        className={`border border-orange-700 bg-orange-700 text-white px-5 py-2 rounded-md transition-colors duration-300 ease-out hover:bg-white hover:text-orange-700 hover:border-orange-700 mt-4 sm:col-span-2 
                        ${!validMatch || !validPassword ? 'bg-[#8b4513] text-[#d2691e] border-[#8b4513] cursor-not-allowed' : ''}`}
                    >
                        Sign Up
                    </button>


                </div>
            </form>
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/login" className="font-semibold text-orange-700 hover:text-gray-600 transition">
                        Log In
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
    );
};

export default SignUp;



{/*
    
    */}