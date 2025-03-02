import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaUserShield,
  FaBan,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";

const ModerationPanel = () => {
  const { user } = useAuth();
  const [reportedContent, setReportedContent] = useState([]);
  const [users, setUsers] = useState([]);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    if (isAdmin) {
      fetchReportedContent();
      fetchUsers();
    }
  }, [isAdmin]);

  // ✅ Fetch Reported Content
  const fetchReportedContent = async () => {
    try {
      const q = query(collection(db, "reports"));
      const querySnapshot = await getDocs(q);
      setReportedContent(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching reported content:", error);
    }
  };

  // ✅ Fetch Users for Moderation
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "!=", "admin"));
      const querySnapshot = await getDocs(q);
      setUsers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Delete Reported Content
  const deleteReportedContent = async (contentId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        await deleteDoc(doc(db, "reports", contentId));
        setReportedContent(
          reportedContent.filter((content) => content.id !== contentId)
        );
      } catch (error) {
        console.error("Error deleting content:", error);
      }
    }
  };

  // ✅ Ban or Unban a User
  const toggleUserBan = async (userId, isBanned) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "users", userId), { banned: !isBanned });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, banned: !isBanned } : u))
      );
    } catch (error) {
      console.error("Error updating user ban status:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserShield className="mr-2 text-red-500" /> Moderation Panel
      </h2>

      {/* ✅ Reported Content Section */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        Reported Content
      </h3>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        {reportedContent.length > 0 ? (
          reportedContent.map((report) => (
            <div
              key={report.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-900 dark:text-white font-semibold">
                {report.reason}
              </p>
              <p className="text-sm text-gray-500">By {report.reportedBy}</p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => deleteReportedContent(report.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash /> Remove Content
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No reported content.
          </p>
        )}
      </div>

      {/* ✅ User Management Section */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        User Moderation
      </h3>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between"
            >
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => toggleUserBan(user.id, user.banned)}
                className={`px-4 py-2 rounded-lg ${
                  user.banned
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white transition`}
              >
                {user.banned ? (
                  <FaCheckCircle className="inline-block mr-2" />
                ) : (
                  <FaBan className="inline-block mr-2" />
                )}
                {user.banned ? "Unban" : "Ban"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No users to moderate.
          </p>
        )}
      </div>
    </div>
  );
};

export default ModerationPanel;
