import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
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
import { FaPoll, FaPlus, FaCheckCircle } from "react-icons/fa";

const CommunityPolls = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: "", options: ["", ""] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  // ✅ Fetch Polls from Firestore
  const fetchPolls = async () => {
    try {
      const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setPolls(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching polls:", error);
      setLoading(false);
    }
  };

  // ✅ Create a New Poll
  const createPoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some((opt) => !opt.trim()))
      return;
    try {
      const pollRef = await addDoc(collection(db, "polls"), {
        ...newPoll,
        votes: newPoll.options.map(() => 0), // Initialize votes for each option
        createdBy: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setPolls([
        { id: pollRef.id, ...newPoll, votes: newPoll.options.map(() => 0) },
        ...polls,
      ]);
      setNewPoll({ question: "", options: ["", ""] });
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  // ✅ Vote on a Poll
  const voteOnPoll = async (pollId, optionIndex) => {
    try {
      const pollRef = doc(db, "polls", pollId);
      await updateDoc(pollRef, { [`votes.${optionIndex}`]: increment(1) });
      setPolls(
        polls.map((poll) =>
          poll.id === pollId
            ? {
                ...poll,
                votes: poll.votes.map((v, i) =>
                  i === optionIndex ? v + 1 : v
                ),
              }
            : poll
        )
      );
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaPoll className="mr-2 text-blue-500" /> Community Polls
      </h2>

      {/* ✅ Create New Poll */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Create a Poll
        </h3>
        <input
          type="text"
          placeholder="Poll Question"
          value={newPoll.question}
          onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />
        {newPoll.options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) =>
              setNewPoll({
                ...newPoll,
                options: newPoll.options.map((opt, i) =>
                  i === index ? e.target.value : opt
                ),
              })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
          />
        ))}
        <button
          onClick={createPoll}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          <FaPlus className="inline-block mr-2" /> Create Poll
        </button>
      </div>

      {/* ✅ Polls List */}
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
        Active Polls
      </h3>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading polls...</p>
        ) : polls.length > 0 ? (
          polls.map((poll) => (
            <div
              key={poll.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {poll.question}
              </h4>
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => voteOnPoll(poll.id, index)}
                  className="mt-2 w-full flex justify-between items-center px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <span>{option}</span>
                  <span className="text-sm text-gray-500">
                    {poll.votes[index]} votes
                  </span>
                </button>
              ))}

              {/* ✅ Poll Results */}
              <div className="mt-3">
                {poll.options.map((option, index) => {
                  const totalVotes = poll.votes.reduce((a, b) => a + b, 0) || 1;
                  const percentage = (
                    (poll.votes[index] / totalVotes) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={index} className="mb-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option}
                      </div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-lg relative">
                        <div
                          className="h-full bg-blue-500 rounded-lg"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No active polls. Create one now!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunityPolls;
