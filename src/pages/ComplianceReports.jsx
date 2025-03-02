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
import { FaClipboardCheck, FaShieldAlt, FaTrash, FaEdit } from "react-icons/fa";

const ComplianceReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    regulation: "",
    auditDate: "",
    summary: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchComplianceReports();
  }, []);

  // ✅ Fetch Compliance Reports from Firestore
  const fetchComplianceReports = async () => {
    try {
      const q = query(
        collection(db, "complianceReports"),
        orderBy("auditDate", "desc")
      );
      const querySnapshot = await getDocs(q);
      setReports(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Compliance Report (Admin Only)
  const submitComplianceReport = async () => {
    if (!newReport.regulation.trim() || !newReport.auditDate.trim()) return;
    try {
      const reportRef = await addDoc(collection(db, "complianceReports"), {
        ...newReport,
        createdAt: serverTimestamp(),
      });
      setReports([{ id: reportRef.id, ...newReport }, ...reports]);
      setNewReport({ regulation: "", auditDate: "", summary: "" });
    } catch (error) {
      console.error("Error adding compliance report:", error);
    }
  };

  // ✅ Update Compliance Report (Admin Only)
  const updateComplianceReport = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "complianceReports", editing.id), editing);
      setReports(reports.map((r) => (r.id === editing.id ? editing : r)));
      setEditing(null);
    } catch (error) {
      console.error("Error updating compliance report:", error);
    }
  };

  // ✅ Delete Compliance Report (Admin Only)
  const deleteComplianceReport = async (reportId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this compliance report?")
    ) {
      try {
        await deleteDoc(doc(db, "complianceReports", reportId));
        setReports(reports.filter((r) => r.id !== reportId));
      } catch (error) {
        console.error("Error deleting compliance report:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaClipboardCheck className="mr-2 text-blue-500" /> Compliance Reports
      </h2>

      {/* ✅ Admin: Submit a New Compliance Report */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {editing ? "Edit Compliance Report" : "Add New Report"}
          </h3>
          <input
            type="text"
            placeholder="Regulation (e.g., GDPR, CCPA, HIPAA)"
            value={editing ? editing.regulation : newReport.regulation}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, regulation: e.target.value })
                : setNewReport({ ...newReport, regulation: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="date"
            placeholder="Audit Date"
            value={editing ? editing.auditDate : newReport.auditDate}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, auditDate: e.target.value })
                : setNewReport({ ...newReport, auditDate: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <textarea
            placeholder="Summary of compliance check"
            value={editing ? editing.summary : newReport.summary}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, summary: e.target.value })
                : setNewReport({ ...newReport, summary: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <button
            onClick={editing ? updateComplianceReport : submitComplianceReport}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {editing ? "Update Report" : "Submit Report"}
          </button>
        </div>
      )}

      {/* ✅ Compliance Reports List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading compliance reports...
          </p>
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {report.regulation}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Audit Date:</strong> {report.auditDate}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {report.summary}
              </p>
              {isAdmin && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => setEditing(report)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteComplianceReport(report.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No compliance reports available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ComplianceReports;
