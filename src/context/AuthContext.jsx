import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig"; // Firestore instance

// Create Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));

        setUser({ ...currentUser, ...userDoc.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with Email & Password
  const signUp = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });

      // Save user details in Firestore
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        displayName,
        email,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      setUser(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  // Sign in with Email & Password
  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  // Google Sign-in
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(firestore, "users", result.user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(firestore, "users", result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          role: "user",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
        signInWithGoogle,
        resetPassword,
        logout,
        loading,
        error,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for easy context usage
export const useAuth = () => useContext(AuthContext);
