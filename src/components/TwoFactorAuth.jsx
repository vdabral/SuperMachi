import { useEffect, useState } from "react";
import { auth, sendPasswordResetEmail } from "../firebaseConfig";
import { firestore } from "../firebaseConfig";

import {
  collection,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
  FaMobileAlt,
} from "react-icons/fa";

const TwoFactorAuth = () => {
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) check2FAStatus();
  }, [user]);

  // ✅ Check if 2FA is enabled for the user
  const check2FAStatus = async () => {
    try {
      const docRef = doc(firestore, "twoFactorAuth", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setIs2FAEnabled(docSnap.data().enabled);
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  // ✅ Toggle 2FA Status
  const toggle2FA = async () => {
    setLoading(true);
    try {
      const docRef = doc(firestore, "twoFactorAuth", user.uid);
      await setDoc(
        docRef,
        { enabled: !is2FAEnabled, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setIs2FAEnabled(!is2FAEnabled);
      setMessage({
        text: `Two-Factor Authentication ${
          !is2FAEnabled ? "Enabled" : "Disabled"
        }.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      setMessage({ text: "Failed to update 2FA settings.", type: "error" });
    }
    setLoading(false);
  };

  // ✅ Generate OTP & Send via Email (Simulated)
  const sendOtp = async () => {
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // 6-digit OTP
    setGeneratedOtp(generatedCode);

    try {
      await addDoc(collection(firestore, "twoFactorAuthRequests"), {
        userId: user.uid,
        otp: generatedCode,
        createdAt: serverTimestamp(),
      });

      setMessage({
        text: "OTP sent to your registered email.",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage({ text: "Failed to send OTP.", type: "error" });
    }
  };

  // ✅ Verify OTP
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setMessage({
        text: "OTP Verified! You are now logged in.",
        type: "success",
      });
    } else {
      setMessage({ text: "Incorrect OTP. Please try again.", type: "error" });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaShieldAlt className="mr-2 text-blue-500" /> Two-Factor Authentication
      </h2>

      {message.text && (
        <div
          className={`p-3 mb-4 text-sm rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <FaCheckCircle className="inline mr-2" />
          ) : (
            <FaTimes className="inline mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* ✅ Toggle 2FA Option */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          Enhance your account security by enabling Two-Factor Authentication
          (2FA).
        </p>
        <button
          onClick={toggle2FA}
          disabled={loading}
          className={`mt-3 w-full ${
            is2FAEnabled
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-2 rounded-lg transition`}
        >
          {loading
            ? "Updating..."
            : is2FAEnabled
            ? "Disable 2FA"
            : "Enable 2FA"}
        </button>
      </div>

      {/* ✅ OTP Verification */}
      {is2FAEnabled && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Verify with OTP
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Click below to receive a One-Time Password (OTP) via email.
          </p>
          <button
            onClick={sendOtp}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center justify-center space-x-2"
          >
            <FaMobileAlt />
            <span>Send OTP</span>
          </button>

          <div className="mt-4">
            <label className="block text-gray-800 dark:text-gray-300 text-sm font-semibold mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            />
            <button
              onClick={verifyOtp}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
