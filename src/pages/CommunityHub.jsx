import React, { useState, useEffect } from "react";
import {
  firestore,
  collection,
  query as firestoreQuery,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "../firebaseConfig";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

const CommunityHub = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // 📌 Fetch posts in real-time using Firestore snapshot
  useEffect(() => {
    const postsQuery = firestoreQuery(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    // 🔥 Real-time listener
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        if (error.code === "permission-denied") {
          alert(
            "You do not have permission to access posts. Check Firestore rules."
          );
        } else {
          alert(
            "Failed to fetch posts. Please check your internet connection."
          );
        }
        setLoading(false);
      }
    );

    return () => unsubscribe(); // ✅ Clean up Firestore listener on unmount
  }, []);

  // 📌 Handle new post submission
  const handleNewPost = async (postData) => {
    if (!currentUser) {
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      await addDoc(collection(firestore, "posts"), {
        ...postData,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email || "Anonymous",
        authorAvatar:
          currentUser.photoURL ||
          `https://i.pravatar.cc/150?u=${currentUser.uid}`,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
      });
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Community Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your thoughts and connect with others
          </p>
        </div>

        {/* Post Form */}
        {currentUser && (
          <div className="mb-8">
            <PostForm
              onSubmit={handleNewPost}
              userAvatar={
                currentUser.photoURL ||
                `https://i.pravatar.cc/150?u=${currentUser.uid}`
              }
              userName={
                currentUser.displayName || currentUser.email || "Anonymous"
              }
            />
          </div>
        )}

        {/* Posts Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  defaultAvatar={`https://i.pravatar.cc/150?u=${post.authorId}`}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <FaUserCircle className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHub;
