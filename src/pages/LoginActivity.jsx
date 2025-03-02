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
import { FaSignInAlt, FaGlobe, FaTrash, FaMapMarkerAlt } from "react-icons/fa";

const LoginActivity = () => {
  const { user } = useAuth();
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchLoginActivity();
  }, []);

  // ✅ Fetch Login Activity from Firestore
  const fetchLoginActivity = async () => {
    try {
      const q = query(
        collection(db, "loginActivity"),
        orderBy("loginTime", "desc")
      );
      const querySnapshot = await getDocs(q);
      setLogins(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching login activity:", error);
      setLoading(false);
    }
  };

  // ✅ Log New Login Activity
  const logUserLogin = async (
    userId,
    userEmail,
    deviceInfo,
    ipAddress,
    location
  ) => {
    try {
      await addDoc(collection(db, "loginActivity"), {
        userId,
        userEmail,
        deviceInfo,
        ipAddress,
        location,
        loginTime: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging user login:", error);
    }
  };

  // ✅ Delete Login Record (Admin Only)
  const deleteLoginRecord = async (logId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this login record?")) {
      try {
        await deleteDoc(doc(db, "loginActivity", logId));
        setLogins(logins.filter((log) => log.id !== logId));
      } catch (error) {
        console.error("Error deleting login record:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaSignInAlt className="mr-2 text-blue-500" /> Login Activity
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Below is a list of your recent login sessions.
      </p>

      {/* ✅ User's Login Activity List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading login history...
          </p>
        ) : logins.length > 0 ? (
          logins.map((log) => (
            <div
              key={log.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {log.userEmail}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Device:</strong> {log.deviceInfo}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>IP Address:</strong> {log.ipAddress}
              </p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                <strong>Location:</strong> {log.location || "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                Logged in on:{" "}
                {new Date(log.loginTime.seconds * 1000).toLocaleString()}
              </p>

              {isAdmin && (
                <button
                  onClick={() => deleteLoginRecord(log.id)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No recent login activity found.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginActivity;
