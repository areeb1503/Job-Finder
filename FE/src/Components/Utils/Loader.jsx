import React from "react";

const Loader = ({ fullScreen = true }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white/70 backdrop-blur-sm z-50">
      <div className="w-16 h-16 border-4 border-orange-700 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
