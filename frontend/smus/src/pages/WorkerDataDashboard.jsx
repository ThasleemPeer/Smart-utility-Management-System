import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function WorkerDataDashboard() {
    const { workerId } = useParams();
    const [workerData, setWorkerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState("");
    const [bookingMessage, setBookingMessage] = useState(""); // New state for request feedback

    console.log("worker id is :",workerId)
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/worker/${workerId}`)
            .then(response => response.json())
            .then(data => {
                setWorkerData(data);
                setLoading(false);
                fetchLocationName(data.location_lat, data.location_lng);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [workerId]);

    const fetchLocationName = async (latitude, longitude) => {
        try {
            const apiKey = "a08bd50c2e254830a81e80d63a545957"; // Replace with your API key
            const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            setLocationName(data.results?.[0]?.formatted || "Location not found");
        } catch (error) {
            console.error("Error fetching location name:", error);
            setLocationName("Location not available");
        }
    };

    // Function to request a worker
    const requestWorker = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/booking/request/${workerId}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify({
                    worker_id: workerId, // Ensure worker_id is passed in the body
                }),
            });
    
            const data = await response.json();
            if (response.ok) {
                setBookingMessage("Booking request sent!");
            } else {
                setBookingMessage(data.error || "Failed to send request.");
            }
        } catch (error) {
            console.error("Error sending booking request:", error);
            setBookingMessage("Something went wrong.");
        }
    };
    

    if (loading) return <p className="text-center text-gray-600">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error loading worker data: {error.message}</p>;
    if (!workerData) return <p className="text-center text-gray-600">No worker data found.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
            <Navbar />
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-6">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">{workerData.username}</h2>
                <p className="text-xl text-gray-600 mb-2">{workerData.service_type}</p>

                <p className="text-lg font-semibold text-gray-800">Location: {locationName}</p>

                <div className={`text-lg font-semibold mt-4 ${workerData.is_available ? "text-green-500" : "text-red-500"}`}>
                    {workerData.is_available ? "Available for Booking" : "Currently Unavailable"}
                </div>

                <button
                    className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    onClick={requestWorker}
                >
                    Request Worker
                </button>

                {bookingMessage && <p className="mt-4 text-blue-600">{bookingMessage}</p>}
            </div>
        </div>
    );
}

function Navbar() {
    return (
        <nav className="bg-orange-500 p-4 shadow-md">
            <h1 className="text-white text-center text-2xl font-bold">Worker Data Dashboard</h1>
        </nav>
    );
}

export default WorkerDataDashboard;
