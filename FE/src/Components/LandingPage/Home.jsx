import React from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';

function Home() {
  // Create a spring animation for opacity and vertical movement
  const props = useSpring({
    to: { opacity: 1, transform: 'translateY(0)' },
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { duration: 500 }, // Adjust duration if needed
  });

  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col items-center">
      <animated.div 
        style={props} 
        className="relative overflow-hidden text-black rounded-lg sm:mx-16 mx-2 sm:py-16 flex flex-col items-center justify-center"
      >
        <div className="relative z-10 max-w-screen-xl px-4 pb-20 pt-10 sm:py-24 mx-auto sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold sm:text-5xl mb-4">
            Find your next opportunity or top talent with <strong>KAAM</strong>.
          </h2>
          <p className="text-lg sm:text-xl mb-8">
            Upload your resume, get personalized job matches, and let our AI craft the perfect cover letter.
          </p>

          <Link
            className="inline-flex text-white items-center px-6 py-3 font-medium bg-orange-700 rounded-lg hover:opacity-75"
            to="/signup" // Adjust the link to your desired path
          >
            Get Started
          </Link>
        </div>
      </animated.div>
    </div>
  );
}

export default Home