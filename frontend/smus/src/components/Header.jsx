import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Hand } from 'lucide-react';

const Header = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await axios.post("http://localhost:8000/api/logout/", { refresh: refreshToken });
      }

      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section with greeting */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Hand 
                  className="w-8 h-8 text-orange-500" 
                  style={{
                    animation: 'wave 2s infinite',
                    transformOrigin: '70% 70%',
                  }}
                />
                <style>
                  {`
                    @keyframes wave {
                      0% { transform: rotate(0deg); }
                      10% { transform: rotate(14deg); }
                      20% { transform: rotate(-8deg); }
                      30% { transform: rotate(14deg); }
                      40% { transform: rotate(-4deg); }
                      50% { transform: rotate(10deg); }
                      60% { transform: rotate(0deg); }
                      100% { transform: rotate(0deg); }
                    }
                  `}
                </style>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 font-bold text-sm">Welcome back,</span>
                <span className="font-bold text-xl text-amber-800">{username}</span>
              </div>
            </div>
          </div>

          {/* Center section with SMUS logo */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
              Smart Utility Management System
            </h1>
          </div>

          {/* Right section with logout button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 hover:shadow-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;