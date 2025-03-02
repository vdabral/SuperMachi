import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaBug,
  FaPlus,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const BugReport = () => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [newBug, setNewBug] = useState({
    title: "",
    description: "",
    severity: "Low",
  });
  const [sortBy, setSortBy] = useState("priority");
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchBugs();
  }, [sortBy]);

  // ✅ Fetch Bug Reports from Firestore
  const fetchBugs = async () => {
    try {
      const q = query(
        collection(db, "bugs"),
        orderBy(sortBy === "priority" ? "severity" : "createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setBugs(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bugs:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Bug Report
  const submitBug = async () => {
    if (!newBug.title.trim() || !newBug.description.trim()) return;
    try {
      const bugRef = await addDoc(collection(db, "bugs"), {
        ...newBug,
        reporter: user.displayName || "Anonymous",
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      setBugs([{ id: bugRef.id, ...newBug, status: "Pending" }, ...bugs]);
      setNewBug({ title: "", description: "", severity: "Low" });
    } catch (error) {
      console.error("Error submitting bug report:", error);
    }
  };

  // ✅ Update Bug Status (Admin Only)
  const updateBugStatus = async (bugId, newStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "bugs", bugId), { status: newStatus });
      setBugs(
        bugs.map((bug) =>
          bug.id === bugId ? { ...bug, status: newStatus } : bug
        )
      );
    } catch (error) {
      console.error("Error updating bug status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBug className="mr-2 text-red-500" /> Bug Report
      </h2>

      {/* ✅ Submit a New Bug Report */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Report an Issue
        </h3>
        <input
          type="text"
          placeholder="Bug Title"
          value={newBug.title}
          onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-300 dark:bg-gray-700"
        />
        <textarea
          placeholder="Describe the issue..."
          value={newBug.description}
          onChange={(e) =>
            setNewBug({ ...newBug, description: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-red-300 dark:bg-gray-700"
        />
        <select
          value={newBug.severity}
          onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-red-300 dark:bg-gray-700"
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <button
          onClick={submitBug}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          <FaPlus className="inline-block mr-2" /> Submit Bug Report
        </button>
      </div>

      {/* ✅ Sort Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Reported Issues
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="priority">Sort by Priority</option>
          <option value="newest">Sort by Newest</option>
        </select>
      </div>

      {/* ✅ Bug List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading bug reports...
          </p>
        ) : bugs.length > 0 ? (
          bugs.map((bug) => (
            <div
              key={bug.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {bug.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {bug.description}
              </p>
              <p className="text-sm text-gray-500">
                Reported by {bug.reporter}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-sm px-2 py-1 rounded-lg ${
                    bug.status === "Resolved"
                      ? "bg-green-500 text-white"
                      : bug.status === "In Progress"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {bug.status}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => updateBugStatus(bug.id, "Resolved")}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaCheckCircle /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No bug reports yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default BugReport;
