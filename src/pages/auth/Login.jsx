import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/trans_bg.png"; // ✅ Correctly import logo

const Login = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate(); // ✅ For redirection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle Email & Password Sign In
  const handleEmailSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // ✅ Redirect to home after login
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      navigate("/"); // ✅ Redirect after Google Sign-In
    } catch (err) {
      setError("Authentication failed. Please try again.");
      console.error("Google Sign-In Error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 px-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-16 mx-auto mb-4" />

        <h2 className="text-3xl font-semibold text-gray-800">Welcome Back!</h2>
        <p className="text-gray-600 mb-4">Login to start collaborating.</p>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Email & Password Form */}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          onClick={handleEmailSignIn}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105 mb-3"
        >
          {loading ? "Processing..." : "Sign In"}
        </button>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105 mb-3"
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* Navigate to Sign-Up Page */}
        <p className="text-gray-500 text-sm mt-2">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")} // ✅ Redirect to Sign-Up Page
          >
            Sign Up
          </span>
        </p>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Continue as Guest Button */}
        <button
          onClick={() => navigate("/")} // ✅ Redirect to home page
          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg transition transform hover:scale-105"
        >
          Continue as Guest
        </button>

        {/* Help Link */}
        <p className="text-gray-500 text-xs mt-4">
          Need help?{" "}
          <a href="/support" className="text-blue-500 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
