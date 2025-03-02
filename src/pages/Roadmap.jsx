import { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaFlagCheckered,
  FaTools,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";

const Roadmap = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("priority");
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchRoadmap();
  }, [filterBy]);

  // ✅ Fetch Roadmap Items from Firestore
  const fetchRoadmap = async () => {
    try {
      const q = query(
        collection(firestore, "roadmap"),
        orderBy(filterBy === "priority" ? "priority" : "createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setRoadmap(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      setLoading(false);
    }
  };

  // ✅ Update Roadmap Status (Admin Only)
  const updateRoadmapStatus = async (roadmapId, newStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(firestore, "roadmap", roadmapId), {
        status: newStatus,
      });
      setRoadmap(
        roadmap.map((item) =>
          item.id === roadmapId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Error updating roadmap status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaClipboardList className="mr-2 text-blue-500" /> Product Roadmap
      </h2>

      {/* ✅ Sort Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Upcoming Features
        </h3>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="priority">Sort by Priority</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>

      {/* ✅ Roadmap Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 🟡 Planned Features */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <FaClipboardList className="mr-2 text-yellow-500" /> Planned
          </h3>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          ) : roadmap.filter((item) => item.status === "Planned").length > 0 ? (
            roadmap
              .filter((item) => item.status === "Planned")
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-b border-gray-300 dark:border-gray-700"
                >
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  {isAdmin && (
                    <button
                      onClick={() =>
                        updateRoadmapStatus(item.id, "In Progress")
                      }
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Move to In Progress
                    </button>
                  )}
                </div>
              ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No planned features.
            </p>
          )}
        </div>

        {/* 🔵 In Progress Features */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <FaTools className="mr-2 text-blue-500" /> In Progress
          </h3>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          ) : roadmap.filter((item) => item.status === "In Progress").length >
            0 ? (
            roadmap
              .filter((item) => item.status === "In Progress")
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-b border-gray-300 dark:border-gray-700"
                >
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  {isAdmin && (
                    <button
                      onClick={() => updateRoadmapStatus(item.id, "Completed")}
                      className="mt-2 text-green-600 hover:text-green-800"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No features in progress.
            </p>
          )}
        </div>

        {/* 🟢 Completed Features */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <FaFlagCheckered className="mr-2 text-green-500" /> Completed
          </h3>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          ) : roadmap.filter((item) => item.status === "Completed").length >
            0 ? (
            roadmap
              .filter((item) => item.status === "Completed")
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-b border-gray-300 dark:border-gray-700"
                >
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <FaCheckCircle className="text-green-500 mt-2" />
                </div>
              ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No completed features yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
