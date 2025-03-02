import { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig";

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
import { FaListAlt, FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const Changelog = () => {
  const { user } = useAuth();
  const [changelog, setChangelog] = useState([]);
  const [newLog, setNewLog] = useState({
    title: "",
    details: "",
    category: "UI Improvement",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchChangelog();
  }, []);

  // ✅ Fetch Changelog Entries from Firestore
  const fetchChangelog = async () => {
    try {
      const q = query(
        collection(firestore, "changelog"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setChangelog(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching changelog:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Changelog Entry (Admin Only)
  const submitChangelogEntry = async () => {
    if (!newLog.title.trim() || !newLog.details.trim()) return;
    try {
      const logRef = await addDoc(collection(firestore, "changelog"), {
        ...newLog,
        createdAt: serverTimestamp(),
      });
      setChangelog([{ id: logRef.id, ...newLog }, ...changelog]);
      setNewLog({ title: "", details: "", category: "UI Improvement" });
    } catch (error) {
      console.error("Error adding changelog entry:", error);
    }
  };

  // ✅ Update Changelog Entry (Admin Only)
  const updateChangelogEntry = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(firestore, "changelog", editing.id), editing);
      setChangelog(
        changelog.map((log) => (log.id === editing.id ? editing : log))
      );
      setEditing(null);
    } catch (error) {
      console.error("Error updating changelog entry:", error);
    }
  };

  // ✅ Delete Changelog Entry (Admin Only)
  const deleteChangelogEntry = async (logId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this changelog entry?")
    ) {
      try {
        await deleteDoc(doc(firestore, "changelog", logId));
        setChangelog(changelog.filter((log) => log.id !== logId));
      } catch (error) {
        console.error("Error deleting changelog entry:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaListAlt className="mr-2 text-green-500" /> Changelog
      </h2>

      {/* ✅ Admin: Submit a New Changelog Entry */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {editing ? "Edit Changelog Entry" : "Add New Changelog Entry"}
          </h3>
          <input
            type="text"
            placeholder="Title (e.g., Button Alignment Fix)"
            value={editing ? editing.title : newLog.title}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, title: e.target.value })
                : setNewLog({ ...newLog, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <textarea
            placeholder="Details about the update"
            value={editing ? editing.details : newLog.details}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, details: e.target.value })
                : setNewLog({ ...newLog, details: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <select
            value={editing ? editing.category : newLog.category}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, category: e.target.value })
                : setNewLog({ ...newLog, category: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          >
            <option value="UI Improvement">🎨 UI Improvement</option>
            <option value="Bug Fix">🐞 Bug Fix</option>
            <option value="Performance Update">⚡ Performance Update</option>
          </select>
          <button
            onClick={editing ? updateChangelogEntry : submitChangelogEntry}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            {editing ? "Update Entry" : "Submit Entry"}
          </button>
        </div>
      )}

      {/* ✅ Changelog Entries List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading changelog...
          </p>
        ) : changelog.length > 0 ? (
          changelog.map((log) => (
            <div
              key={log.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {log.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{log.details}</p>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    log.category === "Bug Fix"
                      ? "bg-red-500"
                      : log.category === "UI Improvement"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                >
                  {log.category}
                </span>
                {isAdmin && (
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => setEditing(log)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteChangelogEntry(log.id)}
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
            No recent changes logged.
          </p>
        )}
      </div>
    </div>
  );
};

export default Changelog;
