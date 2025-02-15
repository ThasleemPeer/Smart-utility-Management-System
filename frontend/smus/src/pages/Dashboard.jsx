import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, Phone, Search } from 'lucide-react';
import Header from "../components/Header";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.user_type !== "client") {
      navigate("/", { replace: true });
    } else {
      setUser(storedUser);
      fetchWorkers();
    }
  }, [navigate]);

  const fetchWorkers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/workers/available/");
      if (!response.ok) {
        throw new Error("Failed to fetch workers");
      }
      const data = await response.json();
      console.log(data)
      setWorkers(data);
      setFilteredWorkers(data); // Initialize filtered workers with all workers
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  useEffect(() => {
    const filterWorkers = () => {
      if (!searchQuery) {
        setFilteredWorkers(workers); // If search query is empty, show all workers
        return;
      }

      const filtered = workers.filter((worker) => {
        const searchTerm = searchQuery.toLowerCase();
        const workerName = worker.username ? worker.username.toLowerCase() : '';
        const workerService = worker.service_type ? worker.service_type.toLowerCase() : '';
        // const workerLocation = worker.location_lat && worker.location_lng
        //   ? `${worker.location_lat}, ${worker.location_lng}`
        //   : ''; // Removed lat/lng filtering

        return (
          workerName.includes(searchTerm) ||
          workerService.includes(searchTerm) // || // Removed location filtering
          // workerLocation.includes(searchTerm)
        );
      });

      setFilteredWorkers(filtered);
    };

    filterWorkers();
  }, [searchQuery, workers]);


  const getLocationName = async (lat, lng) => {
    // Skip invalid coordinates
    if (!lat || !lng || (lat === 0 && lng === 0)) {
      return "Fetching....";
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ServiceApp/1.0', // Required by Nominatim's usage policy
        },
      });

      if (response.status === 429) {
        // Rate limit hit
        return "Location details loading...";
      }

      if (!response.ok) {
        throw new Error("Failed to fetch location name");
      }

      const data = await response.json();
      // Extract desired location information
      const { suburb, county, state_district, state } = data.address;
      const locationString = [suburb, county, state_district, state].filter(Boolean).join(', '); // Filter out empty strings

      return locationString || "location unavailable";
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Fetching....";
    }
  };

  const getWorkerWithLocationNames = async () => {
    try {
      const workersWithLocations = await Promise.all(
        filteredWorkers.map(async (worker, index) => {
          // Skip if we already have the location name
          if (worker.location_name) {
            return worker;
          }
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 500)); // Reduced delay to 0.5 seconds

          if (!worker.location_lat || !worker.location_lng) {
            return { ...worker, location_name: "Fetching..." };
          }

          const locationName = await getLocationName(worker.location_lat, worker.location_lng);
          console.log(locationName)
          return { ...worker, location_name: locationName };
        })
      );
      setFilteredWorkers(workersWithLocations);
    } catch (error) {
      console.error("Error updating worker locations:", error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filteredWorkers.length > 0 && filteredWorkers.some(worker => !worker.location_name)) {
        getWorkerWithLocationNames();
      }
    }, 500); // Reduced debounce time

    return () => clearTimeout(debounceTimer);
  }, [filteredWorkers]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getRandomImage = (service) => {
    const serviceImages = {
      plumber: "https://plus.unsplash.com/premium_photo-1723514415971-b553e8ae2ad7?q=80&w=2014&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      electrician: "https://plus.unsplash.com/premium_photo-1661908782924-de673a5c6988?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      carpenter: "https://plus.unsplash.com/premium_photo-1663089188748-7321b4de4bf1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      painter: "https://plus.unsplash.com/premium_photo-1677130461825-a6af681e401b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      mechanic: "https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      mover: "https://plus.unsplash.com/premium_photo-1726837271041-4df11ad1dab4?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      housekeeper: "https://plus.unsplash.com/premium_photo-1677683510828-ab1a84faf6e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      cctvtechnician: "https://images.unsplash.com/photo-1589935447067-5531094415d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      actechnician: "https://plus.unsplash.com/premium_photo-1682126012378-859ca7a9f4cf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "luggage mover": "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2011&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "interior designer": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "house worker": "https://plus.unsplash.com/premium_photo-1661663121788-e05753413eeb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      default: "https://plus.unsplash.com/premium_photo-1664201890375-f8fa405cdb7d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    };

    return serviceImages[service.toLowerCase()] || serviceImages.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header username={user.username} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Find Your Service Provider
            </h2>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service or location..."
                className="w-full md:w-80 pl-10 pr-4 py-2 rounded-full border-2 border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={getRandomImage(worker.service_type)}
                    alt={worker.service_type}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        {worker.username}
                      </h3>
                      <p className="text-gray-600 capitalize font-medium">
                        {worker.service_type || "No Service Type"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 group-hover:text-orange-500 transition-colors duration-300">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">
                        {worker.location_name || "Fetching...."}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <Clock className="w-5 h-5 mr-2 mt-1 text-orange-500" />
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Weekday: <span className="text-orange-600">₹{worker.hourly_rate_weekday}/hr</span></p>
                        <p className="font-medium">Weekend: <span className="text-orange-600">₹{worker.hourly_rate_weekend}/hr</span></p>
                      </div>
                    </div>
                  </div>

                 
                    <button
                        className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 font-medium shadow-lg shadow-orange-200"
                        onClick={() => navigate(`/worker/${worker.id}`)} // Navigate to WorkerDataDashboard with worker ID
                    >
                        <Phone className="w-5 h-5" />
                        <span>Book Now</span>
                    </button>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-2xl shadow-md max-w-md mx-auto">
              <div className="text-orange-500 mb-4">
                <Clock className="w-12 h-12 mx-auto" />
              </div>
              <p className=" text-gray-600 text-lg font-medium">No service providers available at the moment.</p>
              <p className="text-gray-400 mt-2">Please check back later!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
