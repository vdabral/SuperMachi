import { useState, useEffect } from "react";
import { firestore } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

const CollaborationPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(firestore, "collaborations"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle New Collaboration Post Submission
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "collaborations"), {
        title,
        description,
        category,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setCategory("general");
    } catch (error) {
      console.error("Error creating collaboration post:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Collaboration Hub
      </h2>

      {/* ✅ Collaboration Form */}
      {user ? (
        <form
          onSubmit={handleCreatePost}
          className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
        >
          <input
            type="text"
            placeholder="Collaboration Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
            required
          />
          <textarea
            placeholder="Describe your project or idea..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
          >
            <option value="general">General</option>
            <option value="tech">Tech</option>
            <option value="business">Business</option>
            <option value="health">Health</option>
          </select>
          <button
            type="submit"
            className={`w-full px-6 py-2 text-white rounded-lg transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Posting..." : "Share Collaboration"}
          </button>
        </form>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to post a collaboration request.
        </p>
      )}

      {/* ✅ Collaboration Posts List */}
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No collaboration posts yet. Be the first to share!
        </p>
      )}
    </div>
  );
};

export default CollaborationPage;
