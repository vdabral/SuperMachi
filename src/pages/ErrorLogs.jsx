import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
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
  FaBug,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";

const ErrorLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchErrorLogs();
  }, [filterBy]);

  // ✅ Fetch Error Logs from Firestore
  const fetchErrorLogs = async () => {
    try {
      let q;
      if (filterBy === "all") {
        q = query(collection(db, "errorLogs"), orderBy("createdAt", "desc"));
      } else {
        q = query(collection(db, "errorLogs"), orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      setLogs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLoading(false);
    }
  };

  // ✅ Mark Error as Resolved (Admin Only)
  const resolveError = async (logId) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "errorLogs", logId), { status: "Resolved" });
      setLogs(
        logs.map((log) =>
          log.id === logId ? { ...log, status: "Resolved" } : log
        )
      );
    } catch (error) {
      console.error("Error updating log status:", error);
    }
  };

  // ✅ Delete Error Log (Admin Only)
  const deleteErrorLog = async (logId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this error log?")) {
      try {
        await deleteDoc(doc(db, "errorLogs", logId));
        setLogs(logs.filter((log) => log.id !== logId));
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBug className="mr-2 text-red-500" /> System Error Logs
      </h2>

      {/* ✅ Filter Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Error History
        </h3>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="all">All Errors</option>
          <option value="critical">Critical</option>
          <option value="warning">Warnings</option>
        </select>
      </div>

      {/* ✅ Error Logs List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading error logs...
          </p>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {log.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{log.details}</p>
              <p className="text-sm text-gray-500">
                Occurred at:{" "}
                {new Date(log.createdAt.seconds * 1000).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    log.status === "Resolved"
                      ? "bg-green-500"
                      : log.status === "Critical"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {log.status}
                </span>
                {isAdmin && (
                  <div className="ml-4 flex space-x-2">
                    {log.status !== "Resolved" && (
                      <button
                        onClick={() => resolveError(log.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCheckCircle /> Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={() => deleteErrorLog(log.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No recent errors logged.
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorLogs;
