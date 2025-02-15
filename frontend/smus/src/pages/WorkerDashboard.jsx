import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Clock, Edit } from "lucide-react";
import Header from "../components/Header";

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [jobRequests, setJobRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    hourly_rate_weekday: "",
    hourly_rate_weekend: "",
    is_available: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser  = JSON.parse(localStorage.getItem("user") || "null");

    if (!storedUser  || storedUser .user_type !== "worker") {
      navigate("/", { replace: true });
    } else {
      setWorker(storedUser );
      setFormData({
        username: storedUser .username || "",
        hourly_rate_weekday: storedUser .hourly_rate_weekday || "",
        hourly_rate_weekend: storedUser .hourly_rate_weekend || "",
        is_available: storedUser .is_available || false,
      });
      fetchJobRequests(storedUser .user_id);
    }
  }, [navigate]);

  const fetchJobRequests = async (workerId) => {
    if (!workerId) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/worker/${workerId}/`);
      if (!response.ok) throw new Error("Failed to fetch job requests");
      const data = await response.json();
      setJobRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
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
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/worker/${worker.email}/update/`,
            {
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
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update worker details");
        }

        const data = await response.json();
        
        // Update local storage with new data
        const updatedWorker = {
            ...worker,
            ...data.data
        };
        localStorage.setItem("user", JSON.stringify(updatedWorker));
        
        // Update state
        setWorker(updatedWorker);
        setIsEditing(false);
        
        // Show success message
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating worker details:", error);
        alert(error.message || "Failed to update profile. Please try again.");
    }
};

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header username={worker.username} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-8">
          Your Job Requests
        </h2>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Edit Your Details
          </h3>
          <button
            onClick={handleEditToggle}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-4"
          >
            <Edit className="w-5 h-5 mr-2" /> {isEditing ? "Cancel" : "Edit"}
          </button>
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Weekday Rate</label>
                <input
                  type="number"
                  name="hourly_rate_weekday"
                  value={formData.hourly_rate_weekday}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Weekend Rate</label>
                <input
                  type="number"
                  name="hourly_rate_weekend"
                  value={formData.hourly_rate_weekend}
                  onChange={handleChange}
                  className="border rounded-lg w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Available
                </label>
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div>
              <p className="text-gray-600">Name: {worker?.username}</p>
              <p className="text-gray-600">
                Weekday Rate: ₹{worker?.hourly_rate_weekday}/hr
              </p>
              <p className="text-gray-600">
                Weekend Rate: ₹{worker?.hourly_rate_weekend}/hr
              </p>
              <p className="text-gray-600">
                Availability: {worker?.is_available ? "Available" : "Unavailable"}
              </p>
            </div>
          )}
        </div>

        {jobRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {request.client_name}
                </h3>
                <p className="text-gray-600">Service: {request.service_type}</p>
                <p className="text-gray-600">Location: {request.location}</p>
                <p className="text-gray-600">
                  Scheduled Time:{" "}
                  {new Date(request.scheduled_time).toLocaleString()}
                </p>

                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={() => handleRequestAction(request.id, "accept")}
                    className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    <Check className="w-5 h-5 mr-2" /> Accept
                  </button>
                  <button
                    onClick={() => handleRequestAction(request.id, "reject")}
                    className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    <X className="w-5 h-5 mr-2" /> Reject
                  </button>
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
      </main>
    </div>
  );
};

export default WorkerDashboard;