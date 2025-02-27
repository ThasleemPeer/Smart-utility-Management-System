import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    user_type: "user", // Ensure this is included
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // New state for success message
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false); // Reset success state
    console.log(formData);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true); // Show success message
        setTimeout(() => {
          navigate("/"); // Redirect to login page after 2 seconds
        }, 2000);
      } else {
        if (data.error) {
          setError(data.error);
        } else if (data.phone) {
          setError(data.phone[0]);
        } else {
          setError("Signup failed. Please try again.");
        }
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg relative">
        <h2 className="text-3xl font-bold text-center text-orange-600">Create an Account</h2>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
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
              <h3 className="text-2xl font-bold text-orange-600 mt-2">Welcome Aboard!</h3>
              <p className="text-gray-600">Signup successful! Redirecting to login...</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
          />
          <select
            name="user_type"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
          >
            <option value="client">Client</option>
            <option value="worker">Worker</option>
          </select>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition duration-200"
          >
            Signup
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <a href="/" className="text-orange-600 hover:underline">
            Log in
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

export default Signup;