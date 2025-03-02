import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";
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
import { useAuth } from "../../context/AuthContext";
import { FaShieldAlt, FaExclamationTriangle, FaTrash } from "react-icons/fa";

const SecurityAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchSecurityAlerts();
  }, []);

  // ✅ Fetch Security Alerts from Firestore
  const fetchSecurityAlerts = async () => {
    try {
      const q = query(
        collection(firestore, "securityAlerts"),
        orderBy("alertTime", "desc")
      );
      const querySnapshot = await getDocs(q);
      setAlerts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching security alerts:", error);
      setLoading(false);
    }
  };

  // ✅ Log a New Security Alert (Simulated Example)
  const logSecurityAlert = async (userId, userEmail, message) => {
    try {
      await addDoc(collection(firestore, "securityAlerts"), {
        userId,
        userEmail,
        message,
        alertTime: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging security alert:", error);
    }
  };

  // ✅ Delete Alert (Admin Only)
  const deleteAlert = async (alertId) => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      await deleteDoc(doc(firestore, "securityAlerts", alertId));
      setAlerts(alerts.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaShieldAlt className="mr-2 text-red-500" /> Security Alerts
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Stay informed about suspicious activity or security breaches related to
        your account.
      </p>

      {/* ✅ Security Alerts List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading security alerts...
          </p>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-300">
                <FaExclamationTriangle className="mr-2 text-yellow-500" />
                <strong>Alert:</strong> {alert.message}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {alert.userEmail}
              </p>
              <p className="text-sm text-gray-500">
                Alerted on:{" "}
                {new Date(alert.alertTime.seconds * 1000).toLocaleString()}
              </p>

              {/* ✅ Admin Action: Delete Alert */}
              {isAdmin && (
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No security alerts found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;
