import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // Navigate back to previous page or fallback to home if none
    navigate('/login'); // Uses history to go back, or provides fallback
  };

  return (
    <div className="flex h-screen">
      <div className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-700 mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            You are not authorized to access this page.
          </p>
          <button
            onClick={goBack}
            className="bg-orange-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
