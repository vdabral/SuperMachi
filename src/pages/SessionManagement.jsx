import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaUserLock,
  FaSignOutAlt,
  FaTrash,
  FaMapMarkerAlt,
} from "react-icons/fa";

const SessionManagement = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  // ✅ Fetch Active Sessions from Firestore
  const fetchActiveSessions = async () => {
    try {
      const q = query(
        collection(db, "activeSessions"),
        orderBy("loginTime", "desc")
      );
      const querySnapshot = await getDocs(q);
      setSessions(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      setLoading(false);
    }
  };

  // ✅ Terminate Session (User)
  const terminateSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to log out of this session?"))
      return;
    try {
      await deleteDoc(doc(db, "activeSessions", sessionId));
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Error terminating session:", error);
    }
  };

  // ✅ Force Logout All Sessions (Admin)
  const terminateAllSessions = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to log out all users?")) return;
    try {
      const querySnapshot = await getDocs(collection(db, "activeSessions"));
      querySnapshot.forEach(async (session) => {
        await deleteDoc(doc(db, "activeSessions", session.id));
      });
      setSessions([]);
    } catch (error) {
      console.error("Error terminating all sessions:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserLock className="mr-2 text-blue-500" /> Session Management
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Review and manage active login sessions on different devices.
      </p>

      {/* ✅ Admin: Terminate All Sessions */}
      {isAdmin && (
        <button
          onClick={terminateAllSessions}
          className="mb-4 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Force Logout All Users
        </button>
      )}

      {/* ✅ Active Sessions List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading active sessions...
          </p>
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {session.userEmail}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Device:</strong> {session.deviceInfo}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>IP Address:</strong> {session.ipAddress}
              </p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                <strong>Location:</strong> {session.location || "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                Logged in on:{" "}
                {new Date(session.loginTime.seconds * 1000).toLocaleString()}
              </p>

              {/* ✅ Logout Individual Session */}
              <button
                onClick={() => terminateSession(session.id)}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No active sessions found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;
