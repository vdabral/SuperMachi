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
import { FaCommentAlt, FaThumbsUp, FaPlus } from "react-icons/fa";

const UserFeedback = () => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [sortBy]);

  // ✅ Fetch Feedback from Firestore
  const fetchFeedback = async () => {
    try {
      const q = query(
        collection(firestore, "feedback"),
        orderBy(sortBy === "popular" ? "votes" : "createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setFeedbackList(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setLoading(false);
    }
  };

  // ✅ Submit New Feedback
  const submitFeedback = async () => {
    if (!newFeedback.trim()) return;
    try {
      const feedbackRef = await addDoc(collection(firestore, "feedback"), {
        text: newFeedback,
        author: user.displayName || "Anonymous",
        votes: 0,
        createdAt: serverTimestamp(),
      });
      setFeedbackList([
        { id: feedbackRef.id, text: newFeedback, votes: 0 },
        ...feedbackList,
      ]);
      setNewFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  // ✅ Upvote Feedback
  const upvoteFeedback = async (feedbackId) => {
    try {
      await updateDoc(doc(firestore, "feedback", feedbackId), {
        votes: increment(1),
      });

      setFeedbackList(
        feedbackList.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, votes: feedback.votes + 1 }
            : feedback
        )
      );
    } catch (error) {
      console.error("Error upvoting feedback:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaCommentAlt className="mr-2 text-blue-500" /> User Feedback
      </h2>

      {/* ✅ Submit New Feedback */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Share Your Feedback
        </h3>
        <textarea
          placeholder="What can we improve?"
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />
        <button
          onClick={submitFeedback}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          <FaPlus className="inline-block mr-2" /> Submit Feedback
        </button>
      </div>

      {/* ✅ Sort Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Community Feedback
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
        >
          <option value="popular">Most Upvoted</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* ✅ Feedback List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading feedback...
          </p>
        ) : feedbackList.length > 0 ? (
          feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-900 dark:text-white font-semibold">
                {feedback.text}
              </p>
              <p className="text-sm text-gray-500">By {feedback.author}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Votes: {feedback.votes}
                </span>
                <button
                  onClick={() => upvoteFeedback(feedback.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaThumbsUp />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No feedback yet. Be the first to share!
          </p>
        )}
      </div>
    </div>
  );
};

export default UserFeedback;
