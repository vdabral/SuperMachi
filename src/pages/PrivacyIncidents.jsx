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
  FaUserShield,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";

const PrivacyIncidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchPrivacyIncidents();
  }, [filterBy]);

  // ✅ Fetch Privacy Incidents from Firestore
  const fetchPrivacyIncidents = async () => {
    try {
      let q;
      if (filterBy === "all") {
        q = query(
          collection(db, "privacyIncidents"),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(db, "privacyIncidents"),
          orderBy("createdAt", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      setIncidents(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      setLoading(false);
    }
  };

  // ✅ Mark Incident as Resolved (Admin Only)
  const resolveIncident = async (incidentId) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "privacyIncidents", incidentId), {
        status: "Resolved",
      });
      setIncidents(
        incidents.map((incident) =>
          incident.id === incidentId
            ? { ...incident, status: "Resolved" }
            : incident
        )
      );
    } catch (error) {
      console.error("Error updating incident status:", error);
    }
  };

  // ✅ Delete Privacy Incident (Admin Only)
  const deleteIncident = async (incidentId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this privacy incident?")
    ) {
      try {
        await deleteDoc(doc(db, "privacyIncidents", incidentId));
        setIncidents(
          incidents.filter((incident) => incident.id !== incidentId)
        );
      } catch (error) {
        console.error("Error deleting incident:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserShield className="mr-2 text-purple-500" /> Privacy Incidents
      </h2>

      {/* ✅ Filter Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Reported Privacy Issues
        </h3>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="all">All Reports</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* ✅ Privacy Incidents List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading privacy incidents...
          </p>
        ) : incidents.length > 0 ? (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {incident.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {incident.details}
              </p>
              <p className="text-sm text-gray-500">
                Reported on:{" "}
                {new Date(incident.createdAt.seconds * 1000).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    incident.severity === "Critical"
                      ? "bg-red-500"
                      : incident.severity === "High"
                      ? "bg-orange-500"
                      : incident.severity === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {incident.severity}
                </span>
                {isAdmin && (
                  <div className="ml-4 flex space-x-2">
                    {incident.status !== "Resolved" && (
                      <button
                        onClick={() => resolveIncident(incident.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCheckCircle /> Mark as Resolved
                      </button>
                    )}
                    <button
                      onClick={() => deleteIncident(incident.id)}
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
            No recent privacy issues reported.
          </p>
        )}
      </div>
    </div>
  );
};

export default PrivacyIncidents;
