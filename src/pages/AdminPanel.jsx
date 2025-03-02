import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
import { FaTrash, FaUserShield, FaCheckCircle } from "react-icons/fa";

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
      fetchPosts();
    }
  }, [user]);

  // ✅ Fetch All Users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Fetch All Posts from Firestore
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      setPosts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  // ✅ Delete a Post
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        setPosts(posts.filter((post) => post.id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // ✅ Promote/Demote User Role
  const handleChangeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (window.confirm(`Change role to ${newRole}?`)) {
      try {
        await updateDoc(doc(db, "users", userId), { role: newRole });
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      } catch (error) {
        console.error("Error updating user role:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Admin Panel
      </h2>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
      ) : (
        <>
          {/* ✅ Users List */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Manage Users
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">
                        {user.displayName || "Anonymous"}
                      </td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() =>
                            handleChangeUserRole(user.id, user.role)
                          }
                          className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded transition text-sm"
                        >
                          {user.role === "admin" ? "Demote" : "Promote"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ Posts List */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Manage Posts
            </h3>
            {posts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No posts found.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-md"
                >
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {post.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      By {post.authorName || "Unknown"}
                    </span>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
