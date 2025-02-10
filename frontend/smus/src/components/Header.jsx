import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="flex items-end justify-between p-5 bg-neutral-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-medium text-white">
        Hello <br />
        <span className="text-3xl font-semibold">{username } 👋</span>
      </h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-base font-medium text-white px-5 py-2 rounded-sm hover:bg-red-700 transition duration-200"
      >
        Log Out
      </button>
    </div>
  );
};

export default Header;
