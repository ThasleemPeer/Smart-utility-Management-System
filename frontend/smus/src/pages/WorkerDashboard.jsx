import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Clock, Edit, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import Chat from "../components/Chat";

const serviceTypes = {
  plumber: "https://plus.unsplash.com/premium_photo-1723514415971-b553e8ae2ad7?q=80&w=2014&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  electrician: "https://plus.unsplash.com/premium_photo-1661908782924-de673a5c6988?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  carpenter: "https://plus.unsplash.com/premium_photo-1663089188748-7321b4de4bf1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  painter: "https://plus.unsplash.com/premium_photo-1677130461825-a6af681e401b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  mechanic: "https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  mover: "https://plus.unsplash.com/premium_photo-1726837271041-4df11ad1dab4?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  housekeeper: "https://plus.unsplash.com/premium_photo-1677683510828-ab1a84faf6e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  cctvtechnician: "https://images.unsplash.com/photo-1589935447067-5531094415d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  actechnician: "https://plus.unsplash.com/premium_photo-1682126012378-e05753413eeb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "luggage mover": "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2011&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "interior designer": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "house worker": "https://plus.unsplash.com/premium_photo-1661663121788-e05753413eeb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  default: "https://plus.unsplash.com/premium_photo-1664201890375-f8fa405cdb7d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [jobRequests, setJobRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    hourly_rate_weekday: "",
    hourly_rate_weekend: "",
    is_available: false,
    service_type: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!storedUser || storedUser.user_type !== "worker") {
      navigate("/", { replace: true });
    } else {
      setWorker(storedUser);
      setFormData({
        username: storedUser.username || "",
        hourly_rate_weekday: storedUser.hourly_rate_weekday || "",
        hourly_rate_weekend: storedUser.hourly_rate_weekend || "",
        is_available: storedUser.is_available || false,
        service_type: storedUser.service_type || "",
      });

      fetchJobRequests(storedUser.username);
    }
  }, [navigate]);

  const fetchJobRequests = async (workerName) => {
    if (!workerName) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/`);
      if (!response.ok) throw new Error("Failed to fetch job requests");
      const data = await response.json();

      const filteredData = data.filter((job) => job.worker_name === workerName);
      setJobRequests(filteredData);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update booking status");

      setJobRequests((prev) =>
        prev.map((job) => (job.id === bookingId ? { ...job, status } : job))
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/worker/${worker.email}/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          hourly_rate_weekday: parseFloat(formData.hourly_rate_weekday),
          hourly_rate_weekend: parseFloat(formData.hourly_rate_weekend),
          is_available: formData.is_available,
          service_type: formData.service_type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update worker details");
      }

      const data = await response.json();
      const updatedWorker = { ...worker, ...data.data };
      localStorage.setItem("user", JSON.stringify(updatedWorker));
      setWorker(updatedWorker);
      setIsEditing(false);

      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in";
      successMessage.textContent = "Profile updated successfully!";
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.classList.add("animate-fade-out");
        setTimeout(() => successMessage.remove(), 300);
      }, 3000);
    } catch (error) {
      console.error("Error updating worker details:", error);
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header username={worker.username} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Profile</h2>
              <button
                onClick={handleEditToggle}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isEditing
                    ? "bg-white text-orange-600 hover:bg-gray-100"
                    : "bg-orange-700 text-white hover:bg-orange-800"
                }`}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weekday Rate (₹/hr)</label>
                    <input
                      type="number"
                      name="hourly_rate_weekday"
                      value={formData.hourly_rate_weekday}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      required
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weekend Rate (₹/hr)</label>
                    <input
                      type="number"
                      name="hourly_rate_weekend"
                      value={formData.hourly_rate_weekend}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      required
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                      required
                      disabled={isLoading}
                    >
                      <option value="" disabled>
                        Select service type
                      </option>
                      {Object.keys(serviceTypes).map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleChange}
                        className="sr-only peer"
                        disabled={isLoading}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{worker.username}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Weekday Rate</p>
                  <p className="text-lg font-semibold text-gray-900">₹{worker.hourly_rate_weekday}/hr</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Weekend Rate</p>
                  <p className="text-lg font-semibold text-gray-900">₹{worker.hourly_rate_weekend}/hr</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{worker.service_type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Availability</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      worker.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {worker.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Requests Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Requests</h2>
          {jobRequests.length > 0 ? (
            <div className="space-y-4">
              {jobRequests.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={serviceTypes[job.service_type] || serviceTypes.default}
                      alt={job.service_type}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{job.user_name}</p>
                      <p className="text-sm text-gray-600 capitalize">{job.service_type}</p>
                      <p
                        className={`text-sm font-medium ${
                          job.status === "accepted"
                            ? "text-green-500"
                            : job.status === "rejected"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {job.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {job.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleBookingAction(job.id, "accepted")}
                          className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleBookingAction(job.id, "rejected")}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {job.status === "accepted" && (
                      <button
                        onClick={() =>
                          navigate(`/chat/${job.id}`, {
                            state: { worker: job.worker_name, user_type: "worker" },
                          })
                        }
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200"
                      >
                        Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-orange-500 mb-4" />
              <p className="text-gray-600 text-lg font-medium">No job requests yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;