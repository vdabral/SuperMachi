import { useState } from "react";
import { auth, sendPasswordResetEmail } from "../firebaseConfig";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  FaLock,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const AccountRecovery = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Handle Password Reset Request
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        text: "A password reset email has been sent to your inbox.",
        type: "success",
      });

      // ✅ Log the recovery request in Firestore
      await addDoc(collection(db, "accountRecoveryRequests"), {
        email,
        status: "Pending",
        requestedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setMessage({
        text: "Failed to send password reset email. Please check the email address.",
        type: "error",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaLock className="mr-2 text-blue-500" /> Account Recovery
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Enter your registered email to receive a password reset link.
      </p>

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
            <FaExclamationTriangle className="inline mr-2" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handlePasswordReset}>
        <div className="mb-4">
          <label className="block text-gray-800 dark:text-gray-300 text-sm font-semibold mb-2">
            Email Address
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          {loading ? "Sending..." : "Send Password Reset Email"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        If you don't receive an email, please check your spam folder or contact
        support.
      </p>
    </div>
  );
};

export default AccountRecovery;
