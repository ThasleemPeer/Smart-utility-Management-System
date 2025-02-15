import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Star } from 'lucide-react'; // Import icons from lucide-react

function WorkerDataDashboard() {
    const { workerId } = useParams();
    const [workerData, setWorkerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/worker/${workerId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setWorkerData(data);
                setLoading(false);
                // Fetch location name using latitude and longitude
                fetchLocationName(data.location_lat, data.location_lng);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [workerId]);

    const fetchLocationName = async (latitude, longitude) => {
        try {
            // Replace with your preferred Geocoding API endpoint
            const apiKey = 'a08bd50c2e254830a81e80d63a545957'; // Replace with your API key
            const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch location name');
            }
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                setLocationName(data.results[0].formatted); // Use formatted address
            } else {
                setLocationName('Location not found');
            }
        } catch (error) {
            console.error('Error fetching location name:', error);
            setLocationName('Location not available');
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard icon={MapPin} label="Location" value={locationName} />
                    <InfoCard icon={Clock} label="Weekday Rate" value={`₹${workerData.hourly_rate_weekday}/hr`} />
                    <InfoCard icon={Clock} label="Weekend Rate" value={`₹${workerData.hourly_rate_weekend}/hr`} />
                    <InfoCard icon={Star} label="Availability" value={workerData.is_available ? 'Available' : 'Unavailable'} />
                </div>

                <div className={`text-lg font-semibold mt-4 ${workerData.is_available ? 'text-green-500' : 'text-red-500'}`}>
                    {workerData.is_available ? 'Available for Booking' : 'Currently Unavailable'}
                </div>
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

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md">
            <Icon className="w-6 h-6 text-orange-500 mr-3" />
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
                <p className="text-gray-600">{value}</p>
            </div>
        </div>
    );
}

export default WorkerDataDashboard;
