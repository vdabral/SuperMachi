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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaDatabase,
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";

const BackupAndRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const storage = getStorage();
  const backupFolder = "backups/";

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  // ✅ Fetch Backup History from Firestore
  const fetchBackupHistory = async () => {
    try {
      const q = query(
        collection(db, "backupHistory"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      setBackups(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching backup history:", error);
      setLoading(false);
    }
  };

  // ✅ Create a New Backup
  const createBackup = async () => {
    try {
      const backupData = JSON.stringify(
        { message: "Sample backup data" },
        null,
        2
      );
      const fileName = `backup_${new Date().toISOString()}.json`;
      const storageRef = ref(storage, backupFolder + fileName);

      await uploadBytes(
        storageRef,
        new Blob([backupData], { type: "application/json" })
      );

      const downloadURL = await getDownloadURL(storageRef);
      await addDoc(collection(db, "backupHistory"), {
        fileName,
        downloadURL,
        timestamp: serverTimestamp(),
      });

      fetchBackupHistory();
      alert("Backup created successfully!");
    } catch (error) {
      console.error("Error creating backup:", error);
      alert("Failed to create backup.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaDatabase className="mr-2 text-blue-500" /> Backup & Restore
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Manage platform backups and restore data in case of failure.
      </p>

      {/* ✅ Create Backup */}
      <button
        onClick={createBackup}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center justify-center space-x-2 mb-4"
      >
        <FaCloudUploadAlt />
        <span>Create New Backup</span>
      </button>

      {/* ✅ Backup History List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading backups...</p>
        ) : backups.length > 0 ? (
          backups.map((backup) => (
            <div
              key={backup.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Backup:</strong> {backup.fileName}
              </p>
              <p className="text-sm text-gray-500">
                Created on:{" "}
                {new Date(backup.timestamp.seconds * 1000).toLocaleString()}
              </p>
              <a
                href={backup.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaCloudDownloadAlt className="mr-2" />
                Download Backup
              </a>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No backups found.</p>
        )}
      </div>
    </div>
  );
};

export default BackupAndRestore;
