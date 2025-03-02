import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore, storage } from "../firebaseConfig";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PostCard from "../components/PostCard";

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBio, setNewBio] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [user]);

  // ✅ Fetch User Profile from Firestore
  const fetchUserProfile = async () => {
    try {
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDocs(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
        setNewBio(userSnap.data().bio || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // ✅ Fetch User Posts from Firestore
  const fetchUserPosts = async () => {
    try {
      const q = query(
        collection(firestore, "posts"),
        where("authorId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      setUserPosts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setLoading(false);
    }
  };

  // ✅ Handle Profile Update (Bio & Avatar)
  const handleProfileUpdate = async () => {
    if (!profile) return;
    setUpdating(true);

    try {
      let avatarUrl = profile.photoURL;
      if (newAvatar) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, newAvatar);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        bio: newBio,
        photoURL: avatarUrl,
      });

      setProfile({ ...profile, bio: newBio, photoURL: avatarUrl });
      setNewAvatar(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }

    setUpdating(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        My Dashboard
      </h2>

      {profile ? (
        <div className="flex flex-col items-center">
          {/* ✅ Avatar Section */}
          <div className="relative">
            <img
              src={profile.photoURL || "/default-avatar.png"}
              alt="User Avatar"
              className="w-24 h-24 rounded-full border-2 border-blue-600"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewAvatar(e.target.files[0])}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer"
            >
              ✎
            </label>
          </div>

          {/* ✅ User Info */}
          <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
            {user.displayName || "Anonymous"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>

          {/* ✅ Bio Section */}
          <div className="w-full mt-4">
            <label className="text-gray-700 dark:text-gray-300">Bio</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
              rows="3"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
            />
          </div>

          {/* ✅ Update Button */}
          <button
            onClick={handleProfileUpdate}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            disabled={updating}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      )}

      {/* ✅ User Posts */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          My Posts
        </h3>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            You haven't posted anything yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
