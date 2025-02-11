import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Clock, Star } from "lucide-react";
import Header from "../components/Header";

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [jobRequests, setJobRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.user_type !== "worker") {
      navigate("/", { replace: true });
    } else {
      setWorker(storedUser);
      fetchJobRequests();
    }
  }, [navigate]);

  const fetchJobRequests = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/worker/${worker?.id}/requests/`);
      if (!response.ok) throw new Error("Failed to fetch job requests");
      const data = await response.json();
      setJobRequests(data);
    } catch (error) {
      console.error("Error fetching job requests:", error);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/request/${requestId}/${action}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      // Update job requests after action
      fetchJobRequests();
    } catch (error) {
      console.error(`Error ${action} request:`, error);
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

        {jobRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900">{request.client_name}</h3>
                <p className="text-gray-600">Service: {request.service_type}</p>
                <p className="text-gray-600">Location: {request.location}</p>
                <p className="text-gray-600">
                  Scheduled Time: {new Date(request.scheduled_time).toLocaleString()}
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
