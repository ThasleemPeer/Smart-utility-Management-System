import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // Boolean state for success overlay
  const [username, setUsername] = useState(""); // Store username for success message
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false); // Reset success state

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });

      if (response.status === 200) {
        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access);
          localStorage.setItem("refresh_token", response.data.refresh);

          // Store correct user data including username
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: response.data.email,
              user_type: response.data.user_type,
              user_id: response.data.user_id,
              username: response.data.username,
            })
          );

          // Set success state and username for the message
          setSuccess(true);
          setUsername(response.data.username);

          // Redirect after a short delay to show the success message
          setTimeout(() => {
            if (response.data.user_type === "worker") {
              navigate("/worker-dashboard");
            } else {
              navigate("/dashboard");
            }
          }, 2000); // 2-second delay
        } else {
          setError("Invalid response from server.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setError(err.response?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg relative">
        <h2 className="text-3xl font-bold text-center text-orange-600">Login</h2>

        {/* Error Message */}
        {error && !success && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        {/* Success Overlay */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg z-10">
            <div className="text-center animate-success">
              <svg
                className="w-16 h-16 mx-auto text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="text-2xl font-bold text-orange-600 mt-2">
                Welcome Back, {username}!
              </h3>
              <p className="text-gray-600">Login successful! Redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <a href="/signup" className="text-orange-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

// Add this custom CSS in your stylesheet (e.g., index.css)
const customStyles = `
  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .animate-success {
    animation: bounceIn 0.8s ease-out;
  }
`;

export default Login;