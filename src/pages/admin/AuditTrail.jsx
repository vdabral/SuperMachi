import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { FaClipboardList, FaTrash, FaSearch } from "react-icons/fa";

const AuditTrail = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // ✅ Fetch Audit Logs from Firestore
  const fetchAuditLogs = async () => {
    try {
      const q = query(
        collection(firestore, "auditLogs"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      setLogs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLoading(false);
    }
  };

  // ✅ Delete Audit Log Entry (Admin Only)
  const deleteLog = async (logId) => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await deleteDoc(doc(firestore, "auditLogs", logId));
      setLogs(logs.filter((log) => log.id !== logId));
    } catch (error) {
      console.error("Error deleting log entry:", error);
    }
  };

  // ✅ Filter Logs Based on Search Query
  const filteredLogs = logs.filter(
    (log) =>
      log.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaClipboardList className="mr-2 text-blue-500" /> Audit Trail & System
        Logs
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Track user activities, role changes, and security events across the
        platform.
      </p>

      {/* ✅ Search Audit Logs */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by user email or action..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
        />
        <FaSearch className="absolute right-3 top-3 text-gray-500 dark:text-gray-400" />
      </div>

      {/* ✅ Audit Logs List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading logs...</p>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-300">
                <strong>User:</strong> {log.userEmail}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Action:</strong> {log.action}
              </p>
              <p className="text-sm text-gray-500">
                Timestamp:{" "}
                {new Date(log.timestamp.seconds * 1000).toLocaleString()}
              </p>

              {/* ✅ Admin: Delete Log Entry */}
              {isAdmin && (
                <button
                  onClick={() => deleteLog(log.id)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash /> Delete Log
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No audit logs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
