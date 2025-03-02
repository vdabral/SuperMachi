import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaUserCheck, FaSignInAlt, FaTrash, FaShieldAlt } from "react-icons/fa";

const UserAccessLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchAccessLogs();
  }, [filterBy]);

  // ✅ Fetch User Access Logs from Firestore
  const fetchAccessLogs = async () => {
    try {
      let q;
      if (filterBy === "all") {
        q = query(
          collection(db, "userAccessLogs"),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(db, "userAccessLogs"),
          orderBy("createdAt", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      setLogs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching access logs:", error);
      setLoading(false);
    }
  };

  // ✅ Delete Access Log (Admin Only)
  const deleteLog = async (logId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this access log?")) {
      try {
        await deleteDoc(doc(db, "userAccessLogs", logId));
        setLogs(logs.filter((log) => log.id !== logId));
      } catch (error) {
        console.error("Error deleting access log:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserCheck className="mr-2 text-green-500" /> User Access Logs
      </h2>

      {/* ✅ Filter Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Login Activity
        </h3>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="all">All Logs</option>
          <option value="successful">Successful Logins</option>
          <option value="failed">Failed Attempts</option>
        </select>
      </div>

      {/* ✅ User Access Logs List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading user access logs...
          </p>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {log.eventType}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>User:</strong> {log.userEmail}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>IP Address:</strong> {log.ipAddress}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Device:</strong> {log.deviceInfo}
              </p>
              <p className="text-sm text-gray-500">
                Accessed on:{" "}
                {new Date(log.createdAt.seconds * 1000).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    log.eventType === "Failed Login Attempt"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                >
                  {log.eventType}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteLog(log.id)}
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
            No recent access logs available.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserAccessLogs;
