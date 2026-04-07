import React from "react";

const Loader = ({ fullScreen = true }) => {
  return (
   <div className="flex justify-center items-center min-h-screen">
            {/* Tailwind Spinner */}
            <div className="w-16 h-16 border-4 border-orange-700 border-dashed rounded-full animate-spin"></div>
          </div>
  );
};

export default Loader;