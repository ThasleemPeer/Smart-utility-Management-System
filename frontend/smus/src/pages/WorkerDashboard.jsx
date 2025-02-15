import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Clock, Edit, AlertCircle } from "lucide-react";
import Header from "../components/Header";

const serviceTypes = {
    plumber: "https://plus.unsplash.com/premium_photo-1723514415971-b553e8ae2ad7?q=80&w=2014&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    electrician: "https://plus.unsplash.com/premium_photo-1661908782924-de673a5c6988?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    carpenter: "https://plus.unsplash.com/premium_photo-1663089188748-7321b4de4bf1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    painter: "https://plus.unsplash.com/premium_photo-1677130461825-a6af681e401b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mechanic: "https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    mover: "https://plus.unsplash.com/premium_photo-1726837271041-4df11ad1dab4?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    housekeeper: "https://plus.unsplash.com/premium_photo-1677683510828-ab1a84faf6e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    cctvtechnician: "https://images.unsplash.com/photo-1589935447067-5531094415d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    actechnician: "https://plus.unsplash.com/premium_photo-1682126012378-859ca7a9f4cf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "luggage mover": "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2011&auto=format&fit=crop&ixlib=rb-4.0 ```javascript.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "interior designer": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "house worker": "https://plus.unsplash.com/premium_photo-1661663121788-e05753413eeb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    default: "https://plus.unsplash.com/premium_photo-1664201890375-f8fa405cdb7d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
                service_type: storedUser .service_type || "",
            });

            fetchJobRequests(storedUser .username);
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
                        service_type: formData.service_type,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update worker details");
            }

            const data = await response.json();
            const updatedWorker = {
                ...worker,
                ... data.data
            };
            localStorage.setItem("user", JSON.stringify(updatedWorker));
            setWorker(updatedWorker);
            setIsEditing(false);

            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
            successMessage.textContent = 'Profile updated successfully!';
            document.body.appendChild(successMessage);
            setTimeout(() => {
                successMessage.classList.add('animate-fade-out');
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
        <div className="min-h-screen bg-gray-50">
            <Header username={worker.username} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Profile Details</h3>
                            <button
                                onClick={handleEditToggle}
                                className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
                                    isEditing
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                            required
                                            disabled={isLoading}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weekday Rate (₹/hr)
                                        </label>
                                        <input
                                            type="number"
                                            name="hourly_rate_weekday"
                                            value={formData.hourly_rate_weekday}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                            required
                                            min="0"
                                            step="0.01"
                                            disabled={isLoading}
                                            placeholder="Enter weekday rate"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weekend Rate (₹/hr)
                                        </label>
                                        <input
                                            type="number"
                                            name="hourly_rate_weekend"
                                            value={formData.hourly_rate_weekend}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                            required
                                            min="0"
                                            step="0.01"
                                            disabled={isLoading}
                                            placeholder ="Enter weekend rate"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Type
                                        </label>
                                        <select
                                            name="service_type"
                                            value={formData.service_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
                                            required
                                            disabled={isLoading}
                                        >
                                            <option value="" disabled>Select your service type</option>
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
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                            <span className="ms-3 text-sm font-medium text-gray-700">Available for work</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`flex items-center justify-center px-6 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{worker.username}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Weekday Rate</p>
                                    <p className="text-lg font-semibold text-gray-900">₹{worker.hourly_rate_weekday}/hr</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Weekend Rate</p>
                                    <p className="text-lg font-semibold text-gray-900">₹{worker.hourly_rate_weekend}/hr</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Service Type</p>
                                    <p className="text-lg font-semibold text-gray-900">{worker.service_type}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Availability Status</p>
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${worker.is_available
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${worker.is_available ? 'bg-green-500' : 'bg-gray-500'
                                            }`}></span>
                                        {worker.is_available ? "Available" : "Unavailable"}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p- 6">
                    <h3 className="text-lg font-bold mb-4">Job Requests</h3>
                    {jobRequests.length > 0 ? (
                        jobRequests.map((request) => (
                            <div key={request.id} className="bg-white p-4 rounded-lg shadow-md mb-4 border">
                                <p className="text-gray-800 font-semibold">:User  {request.user_name}</p>
                                <p className="text-gray-800 font-semibold">Worker: {request.worker_name}</p>
                                <p className="text-gray-600">Date & Time: {new Date(request.timestamp).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No job requests available.</p>
                    )}
                </div>

                {jobRequests.length === 0 && (
                    <div className="text-center py-12 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Clock className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No job requests yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WorkerDashboard;