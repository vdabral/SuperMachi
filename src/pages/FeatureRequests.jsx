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
import { FaLightbulb, FaThumbsUp, FaPlus, FaCheckCircle } from "react-icons/fa";

const FeatureRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchRequests();
  }, [sortBy]);

  // ✅ Fetch Feature Requests from Firestore
  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "featureRequests"),
        orderBy(sortBy === "popular" ? "votes" : "createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setRequests(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Feature Request
  const submitRequest = async () => {
    if (!newRequest.trim()) return;
    try {
      const requestRef = await addDoc(collection(db, "featureRequests"), {
        text: newRequest,
        author: user.displayName || "Anonymous",
        votes: 0,
        status: "Under Review",
        createdAt: serverTimestamp(),
      });
      setRequests([
        {
          id: requestRef.id,
          text: newRequest,
          votes: 0,
          status: "Under Review",
        },
        ...requests,
      ]);
      setNewRequest("");
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  // ✅ Upvote a Feature Request
  const upvoteRequest = async (requestId) => {
    try {
      await updateDoc(doc(db, "featureRequests", requestId), {
        votes: increment(1),
      });
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, votes: req.votes + 1 } : req
        )
      );
    } catch (error) {
      console.error("Error upvoting request:", error);
    }
  };

  // ✅ Update Feature Status (Admin Only)
  const updateRequestStatus = async (requestId, newStatus) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "featureRequests", requestId), {
        status: newStatus,
      });
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaLightbulb className="mr-2 text-yellow-500" /> Feature Requests
      </h2>

      {/* ✅ Submit a New Feature Request */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Suggest a Feature
        </h3>
        <textarea
          placeholder="What feature would you like to see?"
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-300 dark:bg-gray-700"
        />
        <button
          onClick={submitRequest}
          className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition"
        >
          <FaPlus className="inline-block mr-2" /> Submit Request
        </button>
      </div>

      {/* ✅ Sort Options */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Community Requests
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

      {/* ✅ Feature Requests List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading feature requests...
          </p>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <p className="text-gray-900 dark:text-white font-semibold">
                {request.text}
              </p>
              <p className="text-sm text-gray-500">By {request.author}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Votes: {request.votes}
                </span>
                <button
                  onClick={() => upvoteRequest(request.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaThumbsUp />
                </button>
              </div>
              <div className="mt-2 flex items-center">
                <span
                  className={`px-2 py-1 rounded-lg text-white text-sm ${
                    request.status === "Implemented"
                      ? "bg-green-500"
                      : request.status === "Planned"
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                >
                  {request.status}
                </span>
                {isAdmin && (
                  <button
                    onClick={() =>
                      updateRequestStatus(request.id, "Implemented")
                    }
                    className="ml-4 text-green-600 hover:text-green-800"
                  >
                    <FaCheckCircle /> Mark as Implemented
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No feature requests yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FeatureRequests;
