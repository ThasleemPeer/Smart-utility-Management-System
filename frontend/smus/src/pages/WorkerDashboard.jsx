import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const WorkerDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.user_type !== "worker") {
      navigate("/", { replace: true });
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Header username={user.username} />
      <h2>Worker Dashboard</h2>
      <p>Welcome, {user.email}</p>
    </div>
  );
};

export default WorkerDashboard;
