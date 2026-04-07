import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/briefcase.png';

function Footer() {
  return (
    <footer className="bg-white border-y">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex-col items-center">
              <img
                src={logo}
                className="mr-3 h-16"
                alt="Logo"
              />
              <p className='text-orange-700 font-extrabold'>&nbsp; KAAM</p>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">Resources</h2>
              <ul className="text-gray-500 font-medium">
                <li className="mb-4">
                  <Link to="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:underline">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center">
            © 2026
            Kaam
            . All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer;