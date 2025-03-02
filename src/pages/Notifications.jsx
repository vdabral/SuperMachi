import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaCheckCircle,
  FaTrash,
  FaBell,
  FaHeart,
  FaComment,
  FaUser,
} from "react-icons/fa";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // ✅ Fetch User Notifications from Firestore
  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      setNotifications(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  // ✅ Mark Notification as Read
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), { read: true });
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ✅ Clear All Notifications
  const clearNotifications = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        const batchPromises = notifications.map((n) =>
          updateDoc(doc(db, "notifications", n.id), { read: true })
        );
        await Promise.all(batchPromises);
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
      } catch (error) {
        console.error("Error clearing notifications:", error);
      }
    }
  };

  // ✅ Filter Notifications by Type
  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || n.type === filter
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBell className="mr-2 text-yellow-500" /> Notifications
      </h2>

      {/* ✅ Filter Options */}
      <div className="mb-4 flex space-x-3">
        {["all", "likes", "comments", "mentions", "system"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* ✅ Notifications List */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">
          Loading notifications...
        </p>
      ) : filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-md flex items-center justify-between mb-3 ${
              notification.read
                ? "bg-gray-100 dark:bg-gray-800"
                : "bg-blue-100 dark:bg-blue-800"
            }`}
          >
            <div className="flex items-center">
              {/* ✅ Notification Type Icon */}
              <span className="mr-3 text-lg">
                {notification.type === "likes" ? (
                  <FaHeart className="text-red-500" />
                ) : notification.type === "comments" ? (
                  <FaComment className="text-blue-500" />
                ) : notification.type === "mentions" ? (
                  <FaUser className="text-green-500" />
                ) : (
                  <FaBell className="text-yellow-500" />
                )}
              </span>

              <div>
                <p className="text-gray-800 dark:text-white">
                  {notification.message}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* ✅ Actions */}
            <div className="flex space-x-2">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaCheckCircle />
                </button>
              )}
              <button
                onClick={() => clearNotifications()}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No new notifications.
        </p>
      )}

      {/* ✅ Clear All Button */}
      {filteredNotifications.length > 0 && (
        <button
          onClick={clearNotifications}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Clear All Notifications
        </button>
      )}
    </div>
  );
};

export default Notifications;
