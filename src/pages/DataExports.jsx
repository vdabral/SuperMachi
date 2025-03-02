import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaDownload, FaFileCsv, FaFileCode } from "react-icons/fa";

const DataExports = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Fetch User Data from Firestore
  const fetchUserData = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setData(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  // ✅ Log Export Request
  const logExportRequest = async (format) => {
    try {
      await addDoc(collection(db, "dataExportRequests"), {
        userId: user.uid,
        userEmail: user.email,
        format,
        requestTime: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging export request:", error);
    }
  };

  // ✅ Convert Data to CSV Format
  const convertToCSV = (data) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  // ✅ Download Data
  const downloadData = () => {
    let fileContent;
    let fileType;
    let fileName = `exported_data_${new Date().toISOString()}`;

    if (exportFormat === "json") {
      fileContent = JSON.stringify(data, null, 2);
      fileType = "application/json";
      fileName += ".json";
    } else {
      fileContent = convertToCSV(data);
      fileType = "text/csv";
      fileName += ".csv";
    }

    const blob = new Blob([fileContent], { type: fileType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logExportRequest(exportFormat);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaDownload className="mr-2 text-blue-500" /> Data Exports
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Download your account and activity data in a secure format.
      </p>

      {/* ✅ Choose Export Format */}
      <div className="mb-4">
        <label className="block text-gray-800 dark:text-gray-300 text-sm font-semibold mb-2">
          Select Export Format
        </label>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      {/* ✅ Download Data */}
      <button
        onClick={downloadData}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center justify-center space-x-2"
      >
        {exportFormat === "json" ? <FaFileCode /> : <FaFileCsv />}
        <span>Download {exportFormat.toUpperCase()} File</span>
      </button>

      {/* ✅ Admin Section: Export All Users' Data */}
      {isAdmin && (
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Admin: Export All User Data
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            As an admin, you can export all user data for compliance or backup
            purposes.
          </p>
          <button
            onClick={downloadData}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition flex items-center justify-center space-x-2"
          >
            <FaDownload />
            <span>Export All User Data</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DataExports;
