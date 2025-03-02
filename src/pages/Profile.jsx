import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore, storage } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PostCard from "../components/PostCard";
// Import the default avatar from assets
import defaultAvatarImg from "../assets/hero-image.png";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBio, setNewBio] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Use the imported image as default avatar
  const defaultAvatar = defaultAvatarImg;

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [user]);

  // Fetch User Profile from Firestore
  const fetchUserProfile = async () => {
    try {
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
        setNewBio(userSnap.data().bio || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Fetch User Posts from Firestore
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

  // Handle Profile Update (Bio & Avatar)
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

  // Handle image load error
  const handleImageError = () => {
    setAvatarError(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        My Profile
      </h2>

      {profile ? (
        <div className="flex flex-col items-center">
          {/* Avatar - Using hero-image.png as default */}
          <div className="relative">
            <img
              src={
                avatarError ? defaultAvatar : profile.photoURL || defaultAvatar
              }
              alt="User Avatar"
              className="w-24 h-24 rounded-full border-2 border-blue-600 object-cover"
              onError={handleImageError}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setNewAvatar(e.target.files[0]);
                setAvatarError(false); // Reset error state when new file selected
              }}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
            >
              ✎
            </label>
          </div>

          {/* User Info */}
          <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
            {user.displayName || "Anonymous"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>

          {/* Bio Section */}
          <div className="w-full mt-4">
            <label className="text-gray-700 dark:text-gray-300 block mb-2">
              Bio
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:text-gray-100"
              rows="3"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Update Button */}
          <button
            onClick={handleProfileUpdate}
            className={`mt-4 ${
              updating ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center min-w-32`}
            disabled={updating}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-24 w-24"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mt-4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-48 mt-2"></div>
          </div>
        </div>
      )}

      {/* User Posts */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          My Posts
        </h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
              >
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You haven't posted anything yet.
            </p>
            <a
              href="/create-post"
              className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Your First Post
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
