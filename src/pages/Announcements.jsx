import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaBullhorn, FaPlus, FaTrash } from "react-icons/fa";

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ✅ Fetch Announcements from Firestore
  const fetchAnnouncements = async () => {
    try {
      const q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setAnnouncements(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setLoading(false);
    }
  };

  // ✅ Post a New Announcement
  const postAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    try {
      const announcementRef = await addDoc(collection(db, "announcements"), {
        text: newAnnouncement,
        createdBy: user.displayName || "Admin",
        createdAt: serverTimestamp(),
      });
      setAnnouncements([
        { id: announcementRef.id, text: newAnnouncement },
        ...announcements,
      ]);
      setNewAnnouncement("");
    } catch (error) {
      console.error("Error posting announcement:", error);
    }
  };

  // ✅ Delete Announcement (Admin Only)
  const deleteAnnouncement = async (announcementId) => {
    if (!isAdmin) return;
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteDoc(doc(db, "announcements", announcementId));
        setAnnouncements(announcements.filter((a) => a.id !== announcementId));
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBullhorn className="mr-2 text-red-500" /> Community Announcements
      </h2>

      {/* ✅ Admin: Create New Announcement */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Create an Announcement
          </h3>
          <textarea
            placeholder="Write your announcement..."
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-300 dark:bg-gray-700"
          />
          <button
            onClick={postAnnouncement}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
          >
            <FaPlus className="inline-block mr-2" /> Post Announcement
          </button>
        </div>
      )}

      {/* ✅ Announcements List */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        Recent Announcements
      </h3>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading announcements...
          </p>
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-900 dark:text-white font-semibold">
                {announcement.text}
              </p>
              <p className="text-sm text-gray-500">
                By {announcement.createdBy}
              </p>
              {isAdmin && (
                <button
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No announcements available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
