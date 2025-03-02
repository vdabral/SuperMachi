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
import { FaClipboardList, FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const ReleaseNotes = () => {
  const { user } = useAuth();
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [newRelease, setNewRelease] = useState({
    version: "",
    date: "",
    features: "",
    fixes: "",
    performance: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchReleaseNotes();
  }, []);

  // ✅ Fetch Release Notes from Firestore
  const fetchReleaseNotes = async () => {
    try {
      const q = query(
        collection(firestore, "releaseNotes"),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      setReleaseNotes(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching release notes:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Release Note (Admin Only)
  const submitReleaseNote = async () => {
    if (!newRelease.version.trim() || !newRelease.date.trim()) return;
    try {
      const releaseRef = await addDoc(collection(firestore, "releaseNotes"), {
        ...newRelease,
        createdAt: serverTimestamp(),
      });
      setReleaseNotes([{ id: releaseRef.id, ...newRelease }, ...releaseNotes]);
      setNewRelease({
        version: "",
        date: "",
        features: "",
        fixes: "",
        performance: "",
      });
    } catch (error) {
      console.error("Error adding release note:", error);
    }
  };

  // ✅ Update Release Note (Admin Only)
  const updateReleaseNote = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(firestore, "releaseNotes", editing.id), editing);
      setReleaseNotes(
        releaseNotes.map((r) => (r.id === editing.id ? editing : r))
      );
      setEditing(null);
    } catch (error) {
      console.error("Error updating release note:", error);
    }
  };

  // ✅ Delete Release Note (Admin Only)
  const deleteReleaseNote = async (releaseId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this release note?")) {
      try {
        await deleteDoc(doc(firestore, "releaseNotes", releaseId));
        setReleaseNotes(releaseNotes.filter((r) => r.id !== releaseId));
      } catch (error) {
        console.error("Error deleting release note:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaClipboardList className="mr-2 text-blue-500" /> Release Notes
      </h2>

      {/* ✅ Admin: Submit a New Release */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {editing ? "Edit Release Note" : "Add New Release Note"}
          </h3>
          <input
            type="text"
            placeholder="Version (e.g., v1.2.3)"
            value={editing ? editing.version : newRelease.version}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, version: e.target.value })
                : setNewRelease({ ...newRelease, version: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="date"
            placeholder="Release Date"
            value={editing ? editing.date : newRelease.date}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, date: e.target.value })
                : setNewRelease({ ...newRelease, date: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <textarea
            placeholder="New Features"
            value={editing ? editing.features : newRelease.features}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, features: e.target.value })
                : setNewRelease({ ...newRelease, features: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <textarea
            placeholder="Bug Fixes"
            value={editing ? editing.fixes : newRelease.fixes}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, fixes: e.target.value })
                : setNewRelease({ ...newRelease, fixes: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <textarea
            placeholder="Performance Improvements"
            value={editing ? editing.performance : newRelease.performance}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, performance: e.target.value })
                : setNewRelease({ ...newRelease, performance: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <button
            onClick={editing ? updateReleaseNote : submitReleaseNote}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {editing ? "Update Release" : "Submit Release Note"}
          </button>
        </div>
      )}

      {/* ✅ Release Notes List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading release notes...
          </p>
        ) : releaseNotes.length > 0 ? (
          releaseNotes.map((release) => (
            <div
              key={release.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {release.version} - {release.date}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Features:</strong> {release.features}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Bug Fixes:</strong> {release.fixes}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Performance:</strong> {release.performance}
              </p>
              {isAdmin && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => setEditing(release)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteReleaseNote(release.id)}
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
            No release notes available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReleaseNotes;
