import { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaServer,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const SystemStatus = () => {
  const { user } = useAuth();
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [newStatus, setNewStatus] = useState({
    title: "",
    details: "",
    status: "Operational",
  });
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchStatusUpdates();
  }, []);

  // ✅ Fetch System Status Updates from Firestore
  const fetchStatusUpdates = async () => {
    try {
      const q = query(
        collection(firestore, "systemStatus"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setStatusUpdates(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching system status updates:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New System Status Update (Admin Only)
  const submitStatusUpdate = async () => {
    if (!newStatus.title.trim() || !newStatus.details.trim()) return;
    try {
      const statusRef = await addDoc(collection(firestore, "systemStatus"), {
        ...newStatus,
        createdAt: serverTimestamp(),
      });
      setStatusUpdates([{ id: statusRef.id, ...newStatus }, ...statusUpdates]);
      setNewStatus({ title: "", details: "", status: "Operational" });
    } catch (error) {
      console.error("Error adding system status update:", error);
    }
  };

  // ✅ Delete System Status Update (Admin Only)
  const deleteStatusUpdate = async (statusId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this status update?")) {
      try {
        await deleteDoc(doc(firestore, "systemStatus", statusId));
        setStatusUpdates(statusUpdates.filter((s) => s.id !== statusId));
      } catch (error) {
        console.error("Error deleting system status update:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaServer className="mr-2 text-green-500" /> System Status
      </h2>

      {/* ✅ Admin: Submit a New System Status */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Post a Status Update
          </h3>
          <input
            type="text"
            placeholder="Title (e.g., Scheduled Maintenance)"
            value={newStatus.title}
            onChange={(e) =>
              setNewStatus({ ...newStatus, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <textarea
            placeholder="Details about the issue or maintenance"
            value={newStatus.details}
            onChange={(e) =>
              setNewStatus({ ...newStatus, details: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <select
            value={newStatus.status}
            onChange={(e) =>
              setNewStatus({ ...newStatus, status: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          >
            <option value="Operational">🟢 Operational</option>
            <option value="Maintenance">🟡 Scheduled Maintenance</option>
            <option value="Degraded">🟠 Degraded Performance</option>
            <option value="Outage">🔴 Major Outage</option>
          </select>
          <button
            onClick={submitStatusUpdate}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            <FaPlus className="inline-block mr-2" /> Post Update
          </button>
        </div>
      )}

      {/* ✅ System Status Updates List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading system status...
          </p>
        ) : statusUpdates.length > 0 ? (
          statusUpdates.map((update) => (
            <div
              key={update.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {update.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {update.details}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    update.status === "Operational"
                      ? "bg-green-500"
                      : update.status === "Maintenance"
                      ? "bg-yellow-500"
                      : update.status === "Degraded"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                >
                  {update.status}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteStatusUpdate(update.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No recent system updates.
          </p>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;
