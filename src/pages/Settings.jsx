import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore, auth, storage } from "../firebaseConfig";

import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword } from "firebase/auth";

const Settings = () => {
  const { user } = useAuth();
  const [newName, setNewName] = useState(user.displayName || "");
  const [newBio, setNewBio] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : false;
  });

  const [notifications, setNotifications] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  // ✅ Handle Profile Update (Name, Bio, Avatar)
  const handleProfileUpdate = async () => {
    setUpdating(true);
    try {
      let avatarUrl = user.photoURL;
      if (newAvatar) {
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, newAvatar);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      await updateDoc(doc(firestore, "users", user.uid), {
        displayName: newName,
        bio: newBio,
        photoURL: avatarUrl,
      });

      setNewAvatar(null);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setUpdating(false);
  };

  // ✅ Handle Password Change
  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await updatePassword(auth.currentUser, password);
      alert("Password changed successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to change password.");
    }
  };

  // ✅ Handle Dark Mode Toggle
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.documentElement.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Settings
      </h2>

      {/* ✅ Profile Section */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Update Profile
        </h3>

        <div className="mt-4 flex flex-col items-center">
          <img
            src={user.photoURL || "/default-avatar.png"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-2 border-blue-600"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewAvatar(e.target.files[0])}
            className="mt-2"
          />
        </div>

        <input
          type="text"
          placeholder="Full Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mt-4 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />

        <textarea
          placeholder="Short Bio"
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />

        <button
          onClick={handleProfileUpdate}
          className={`mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-lg transition ${
            updating ? "bg-gray-400 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={updating}
        >
          {updating ? "Updating..." : "Save Changes"}
        </button>
      </div>

      {/* ✅ Password Change Section */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Change Password
        </h3>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mt-4 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />

        <button
          onClick={handlePasswordChange}
          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Change Password
        </button>
      </div>

      {/* ✅ Preferences Section */}
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Preferences
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">
            Enable Dark Mode
          </span>
          <button
            onClick={toggleDarkMode}
            className={`px-6 py-2 rounded-lg transition ${
              darkMode ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-800"
            }`}
          >
            {darkMode ? "ON" : "OFF"}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">
            Receive Notifications
          </span>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`px-6 py-2 rounded-lg transition ${
              notifications
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            {notifications ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
