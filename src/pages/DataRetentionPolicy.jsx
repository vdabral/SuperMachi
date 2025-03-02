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
import { FaDatabase, FaTrash, FaEdit, FaPlusCircle } from "react-icons/fa";

const DataRetentionPolicy = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [newPolicy, setNewPolicy] = useState({
    dataType: "",
    retentionPeriod: "",
    description: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchPolicies();
  }, []);

  // ✅ Fetch Data Retention Policies from Firestore
  const fetchPolicies = async () => {
    try {
      const q = query(
        collection(db, "dataRetentionPolicies"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setPolicies(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching policies:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Data Retention Policy (Admin Only)
  const submitPolicy = async () => {
    if (!newPolicy.dataType.trim() || !newPolicy.retentionPeriod.trim()) return;
    try {
      const policyRef = await addDoc(collection(db, "dataRetentionPolicies"), {
        ...newPolicy,
        createdAt: serverTimestamp(),
      });
      setPolicies([{ id: policyRef.id, ...newPolicy }, ...policies]);
      setNewPolicy({ dataType: "", retentionPeriod: "", description: "" });
    } catch (error) {
      console.error("Error adding policy:", error);
    }
  };

  // ✅ Update Data Retention Policy (Admin Only)
  const updatePolicy = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "dataRetentionPolicies", editing.id), editing);
      setPolicies(policies.map((p) => (p.id === editing.id ? editing : p)));
      setEditing(null);
    } catch (error) {
      console.error("Error updating policy:", error);
    }
  };

  // ✅ Delete Data Retention Policy (Admin Only)
  const deletePolicy = async (policyId) => {
    if (!isAdmin) return;
    if (
      window.confirm(
        "Are you sure you want to delete this data retention policy?"
      )
    ) {
      try {
        await deleteDoc(doc(db, "dataRetentionPolicies", policyId));
        setPolicies(policies.filter((p) => p.id !== policyId));
      } catch (error) {
        console.error("Error deleting policy:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaDatabase className="mr-2 text-blue-500" /> Data Retention Policy
      </h2>

      {/* ✅ Admin: Submit a New Data Retention Policy */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {editing ? "Edit Data Retention Policy" : "Add New Policy"}
          </h3>
          <input
            type="text"
            placeholder="Data Type (e.g., User Profile Data)"
            value={editing ? editing.dataType : newPolicy.dataType}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, dataType: e.target.value })
                : setNewPolicy({ ...newPolicy, dataType: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="Retention Period (e.g., 2 years)"
            value={
              editing ? editing.retentionPeriod : newPolicy.retentionPeriod
            }
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, retentionPeriod: e.target.value })
                : setNewPolicy({
                    ...newPolicy,
                    retentionPeriod: e.target.value,
                  })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <textarea
            placeholder="Description (e.g., User data is stored for compliance reasons)"
            value={editing ? editing.description : newPolicy.description}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, description: e.target.value })
                : setNewPolicy({ ...newPolicy, description: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
          />
          <button
            onClick={editing ? updatePolicy : submitPolicy}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {editing ? "Update Policy" : "Submit Policy"}
          </button>
        </div>
      )}

      {/* ✅ Data Retention Policies List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading data retention policies...
          </p>
        ) : policies.length > 0 ? (
          policies.map((policy) => (
            <div
              key={policy.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {policy.dataType}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Retention Period:</strong> {policy.retentionPeriod}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {policy.description}
              </p>
              {isAdmin && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => setEditing(policy)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deletePolicy(policy.id)}
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
            No data retention policies available.
          </p>
        )}
      </div>
    </div>
  );
};

export default DataRetentionPolicy;
