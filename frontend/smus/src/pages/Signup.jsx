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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log(formData);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please log in.");
        navigate("/"); // Redirect to login page
      } else {
        setError(data.error || console.log(data.error));
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-orange-600">Create an Account</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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

export default Signup;