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
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";

const SecurityReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchSecurityReports();
  }, [filterBy]);

  // ✅ Fetch Security Reports from Firestore
  const fetchSecurityReports = async () => {
    try {
      let q;
      if (filterBy === "all") {
        q = query(
          collection(db, "securityReports"),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(
          collection(db, "securityReports"),
          orderBy("createdAt", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      setReports(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setLoading(false);
    }
  };

  // ✅ Mark Report as Reviewed (Admin Only)
  const resolveReport = async (reportId) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "securityReports", reportId), {
        status: "Reviewed",
      });
      setReports(
        reports.map((report) =>
          report.id === reportId ? { ...report, status: "Reviewed" } : report
        )
      );
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  // ✅ Delete Security Report (Admin Only)
  const deleteReport = async (reportId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this security report?")
    ) {
      try {
        await deleteDoc(doc(db, "securityReports", reportId));
        setReports(reports.filter((report) => report.id !== reportId));
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaShieldAlt className="mr-2 text-blue-500" /> Security Reports
      </h2>

      {/* ✅ Filter Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Reported Security Issues
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

      {/* ✅ Security Reports List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading security reports...
          </p>
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {report.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {report.details}
              </p>
              <p className="text-sm text-gray-500">
                Reported on:{" "}
                {new Date(report.createdAt.seconds * 1000).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    report.severity === "Critical"
                      ? "bg-red-500"
                      : report.severity === "High"
                      ? "bg-orange-500"
                      : report.severity === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {report.severity}
                </span>
                {isAdmin && (
                  <div className="ml-4 flex space-x-2">
                    {report.status !== "Reviewed" && (
                      <button
                        onClick={() => resolveReport(report.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaCheckCircle /> Mark as Reviewed
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(report.id)}
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
            No recent security issues reported.
          </p>
        )}
      </div>
    </div>
  );
};

export default SecurityReports;
