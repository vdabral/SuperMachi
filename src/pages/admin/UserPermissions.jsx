import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { FaUserShield, FaUserCheck, FaUserTimes } from "react-icons/fa";

const UserPermissions = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Fetch Users from Firestore
  const fetchUsers = async () => {
    try {
      const q = query(collection(firestore, "users"), orderBy("role", "asc"));

      const querySnapshot = await getDocs(q);
      setUsers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // ✅ Update User Role
  const updateUserRole = async (userId, newRole) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(firestore, "users", userId), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaUserShield className="mr-2 text-blue-500" /> User Permissions & Roles
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Manage user roles and permissions to control access levels on the
        platform.
      </p>

      {/* ✅ User Permissions Table */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        ) : users.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="py-2 px-3 text-gray-800 dark:text-gray-200">
                  User
                </th>
                <th className="py-2 px-3 text-gray-800 dark:text-gray-200">
                  Email
                </th>
                <th className="py-2 px-3 text-gray-800 dark:text-gray-200">
                  Role
                </th>
                <th className="py-2 px-3 text-gray-800 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    {u.name || "Unknown"}
                  </td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    {u.email}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-red-500 text-white"
                          : u.role === "moderator"
                          ? "bg-yellow-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {isAdmin && (
                      <div className="flex space-x-2">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => updateUserRole(u.id, "admin")}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaUserCheck /> Make Admin
                          </button>
                        )}
                        {u.role !== "moderator" && (
                          <button
                            onClick={() => updateUserRole(u.id, "moderator")}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            <FaUserCheck /> Make Moderator
                          </button>
                        )}
                        {u.role !== "user" && (
                          <button
                            onClick={() => updateUserRole(u.id, "user")}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaUserTimes /> Demote to User
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UserPermissions;
