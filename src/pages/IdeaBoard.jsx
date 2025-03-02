import { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  increment,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaThumbsUp, FaThumbsDown, FaLightbulb, FaPlus } from "react-icons/fa";

const IdeaBoard = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, [sortBy]);

  // ✅ Fetch Ideas from Firestore
  const fetchIdeas = async () => {
    try {
      const q = query(
        collection(db, "ideas"),
        orderBy(sortBy === "trending" ? "votes" : "createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setIdeas(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Idea
  const submitIdea = async () => {
    if (!newIdea.trim()) return;
    try {
      const ideaRef = await addDoc(collection(db, "ideas"), {
        text: newIdea,
        author: user.displayName || "Anonymous",
        authorId: user.uid,
        votes: 0,
        createdAt: serverTimestamp(),
      });
      setIdeas([{ id: ideaRef.id, text: newIdea, votes: 0 }, ...ideas]);
      setNewIdea("");
    } catch (error) {
      console.error("Error submitting idea:", error);
    }
  };

  // ✅ Upvote Idea
  const upvoteIdea = async (ideaId) => {
    try {
      await updateDoc(doc(db, "ideas", ideaId), { votes: increment(1) });
      setIdeas(
        ideas.map((idea) =>
          idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
        )
      );
    } catch (error) {
      console.error("Error upvoting idea:", error);
    }
  };

  // ✅ Downvote Idea
  const downvoteIdea = async (ideaId) => {
    try {
      await updateDoc(doc(db, "ideas", ideaId), { votes: increment(-1) });
      setIdeas(
        ideas.map((idea) =>
          idea.id === ideaId ? { ...idea, votes: idea.votes - 1 } : idea
        )
      );
    } catch (error) {
      console.error("Error downvoting idea:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaLightbulb className="mr-2 text-yellow-500" /> Idea Board
      </h2>

      {/* ✅ Submit New Idea */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Share Your Idea
        </h3>
        <textarea
          placeholder="Describe your idea..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-300 dark:bg-gray-700"
        />
        <button
          onClick={submitIdea}
          className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition"
        >
          <FaPlus className="inline-block mr-2" /> Submit Idea
        </button>
      </div>

      {/* ✅ Sort Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Community Ideas
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* ✅ Ideas List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading ideas...</p>
        ) : ideas.length > 0 ? (
          ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-900 dark:text-white font-semibold">
                {idea.text}
              </p>
              <p className="text-sm text-gray-500">By {idea.author}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Votes: {idea.votes}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => upvoteIdea(idea.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    onClick={() => downvoteIdea(idea.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaThumbsDown />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No ideas yet. Be the first to share!
          </p>
        )}
      </div>
    </div>
  );
};

export default IdeaBoard;
