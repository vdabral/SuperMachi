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
import { FaUserShield, FaCheckCircle, FaTrash, FaEdit } from "react-icons/fa";

const UserAgreements = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [newAgreement, setNewAgreement] = useState({
    title: "",
    version: "",
    content: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchUserAgreements();
  }, []);

  // ✅ Fetch User Agreements from Firestore
  const fetchUserAgreements = async () => {
    try {
      const q = query(
        collection(db, "userAgreements"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setAgreements(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user agreements:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New User Agreement (Admin Only)
  const submitUserAgreement = async () => {
    if (
      !newAgreement.title.trim() ||
      !newAgreement.version.trim() ||
      !newAgreement.content.trim()
    )
      return;
    try {
      const agreementRef = await addDoc(collection(db, "userAgreements"), {
        ...newAgreement,
        createdAt: serverTimestamp(),
      });
      setAgreements([{ id: agreementRef.id, ...newAgreement }, ...agreements]);
      setNewAgreement({ title: "", version: "", content: "" });
    } catch (error) {
      console.error("Error adding user agreement:", error);
    }
  };

  // ✅ Update User Agreement (Admin Only)
  const updateUserAgreement = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "userAgreements", editing.id), editing);
      setAgreements(agreements.map((a) => (a.id === editing.id ? editing : a)));
      setEditing(null);
    } catch (error) {
      console.error("Error updating user agreement:", error);
    }
  };

  // ✅ Delete User Agreement (Admin Only)
  const deleteUserAgreement = async (agreementId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this user agreement?")
    ) {
      try {
        await deleteDoc(doc(db, "userAgreements", agreementId));
        setAgreements(agreements.filter((a) => a.id !== agreementId));
      } catch (error) {
        console.error("Error deleting user agreement:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserShield className="mr-2 text-blue-500" /> User Agreements
      </h2>

      {/* ✅ Admin: Submit a New User Agreement */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {editing ? "Edit User Agreement" : "Add New Agreement"}
          </h3>
          <input
            type="text"
            placeholder="Agreement Title (e.g., Terms of Service)"
            value={editing ? editing.title : newAgreement.title}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, title: e.target.value })
                : setNewAgreement({ ...newAgreement, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Version (e.g., 1.2.3)"
            value={editing ? editing.version : newAgreement.version}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, version: e.target.value })
                : setNewAgreement({ ...newAgreement, version: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <textarea
            placeholder="Agreement Content"
            value={editing ? editing.content : newAgreement.content}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, content: e.target.value })
                : setNewAgreement({ ...newAgreement, content: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
            rows="6"
          />
          <button
            onClick={editing ? updateUserAgreement : submitUserAgreement}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {editing ? "Update Agreement" : "Submit Agreement"}
          </button>
        </div>
      )}

      {/* ✅ User Agreements List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading user agreements...
          </p>
        ) : agreements.length > 0 ? (
          agreements.map((agreement) => (
            <div
              key={agreement.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {agreement.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Version:</strong> {agreement.version}
              </p>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {agreement.content}
              </p>
              <div className="mt-2 flex space-x-3">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setEditing(agreement)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => deleteUserAgreement(agreement.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No user agreements available.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserAgreements;
