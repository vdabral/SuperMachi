import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  orderByChild,
  limitToLast,
  off,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// 🔥 Firebase Configuration (Environment Variables for Security)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { googleProvider };

// ======================== //
// 🔥 HELPER FUNCTIONS //
// ======================== //

// ✅ Current Time Formatter (UTC)
export const getCurrentUTCTime = () =>
  new Date().toISOString().replace("T", " ").split(".")[0];

// ✅ Format Firestore Timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Unknown date";
  return new Date(timestamp).toLocaleString();
};

// ✅ Centralized Error Handler
export const handleFirebaseError = (error) => {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/network-request-failed": "Check your internet connection.",
    "database/permission-denied":
      "You don't have permission to access this data.",
    "storage/unauthorized": "User not authorized to perform this action.",
  };
  return {
    code: error.code,
    message: errorMessages[error.code] || error.message,
  };
};

// ====================== //
// 🔥 AUTH FUNCTIONS //
// ====================== //

// ✅ Google Sign-In
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ✅ Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ====================== //
// 🔥 FIRESTORE CRUD //
// ====================== //

// ✅ Add Post (Firestore)
export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(firestore, "posts"), {
      ...postData,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: [],
    });
    return docRef.id;
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ✅ Get Posts (Firestore)
export const fetchPosts = async (limit = 10) => {
  try {
    const q = query(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc"),
      limitToLast(limit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ✅ Upvote Post (Firestore)
export const upvotePost = async (postId) => {
  try {
    const postRef = doc(firestore, "posts", postId);
    await updateDoc(postRef, { upvotes: increment(1) });
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ✅ Delete Post (Firestore)
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(firestore, "posts", postId));
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ============================= //
// 🔥 REALTIME DATABASE CRUD //
// ============================= //

// ✅ Add Post (Realtime Database)
export const addPost = async (title, description, userId, imageUrl = null) => {
  if (!title?.trim() || !description?.trim() || !userId) {
    throw new Error("Missing required post data");
  }

  const postRef = ref(database, "posts/");
  const newPostRef = push(postRef);
  const timestamp = getCurrentUTCTime();

  const postData = {
    id: newPostRef.key,
    title: title.trim(),
    description: description.trim(),
    userId,
    authorName: auth.currentUser?.displayName || "Anonymous",
    authorPhotoURL: auth.currentUser?.photoURL,
    upvotes: 0,
    timestamp,
    updatedAt: timestamp,
    imageUrl,
    commentCount: 0,
    shareCount: 0,
  };

  try {
    await set(newPostRef, postData);
    return newPostRef.key;
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ✅ Get Posts (Realtime Database)
export const getPosts = (callback, limit = 20) => {
  const postRef = ref(database, "posts/");
  const postsQuery = query(
    postRef,
    orderByChild("timestamp"),
    limitToLast(limit)
  );

  const listener = onValue(
    postsQuery,
    (snapshot) => {
      const data = snapshot.val();
      const postsArray = data
        ? Object.entries(data)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        : [];
      callback(postsArray);
    },
    (error) => {
      console.error("Error fetching posts:", error);
      callback([]);
    }
  );

  return () => off(postRef, "value", listener);
};

// ========================== //
// 🔥 FIREBASE STORAGE API //
// ========================== //

// ✅ Upload Image
export const uploadImage = async (file) => {
  try {
    const fileRef = storageRef(storage, `posts/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// ===================== //
// ✅ EXPORT EVERYTHING //
// ===================== //
export {
  auth,
  firestore,
  database,
  storage,
  logoutUser as logout,
  addDoc,
  collection,
  query,
  getDocs,
  limit,
  orderBy,
  serverTimestamp,
  onSnapshot,
};
