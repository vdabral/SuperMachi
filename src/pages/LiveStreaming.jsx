import { useEffect, useRef, useState } from "react";
import {
  FaVideo,
  FaCommentDots,
  FaStopCircle,
  FaPlayCircle,
} from "react-icons/fa";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const LiveStreaming = () => {
  const { user } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    fetchLiveComments();
  }, []);

  // ✅ Fetch Live Comments
  const fetchLiveComments = async () => {
    const q = query(
      collection(db, "livestream_comments"),
      orderBy("createdAt", "asc")
    );
    onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  };

  // ✅ Start Live Streaming
  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // ✅ Stop Live Streaming
  const stopStreaming = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsStreaming(false);
  };

  // ✅ Send Live Comment
  const sendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addDoc(collection(db, "livestream_comments"), {
        text: newComment,
        userName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Live Streaming
      </h2>

      {/* ✅ Live Stream Video */}
      <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Click "Start Streaming" to go live
          </p>
        )}
      </div>

      {/* ✅ Streaming Controls */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={isStreaming ? stopStreaming : startStreaming}
          className={`p-3 rounded-full text-white ${
            isStreaming ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {isStreaming ? <FaStopCircle /> : <FaPlayCircle />}
        </button>
      </div>

      {/* ✅ Live Comments Section */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <FaCommentDots className="mr-2 text-blue-500" /> Live Comments
        </h3>

        <div className="h-40 overflow-y-auto mt-3 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-2 border-b border-gray-300 dark:border-gray-600"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {comment.userName}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {comment.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No comments yet.</p>
          )}
        </div>

        {/* ✅ Comment Input */}
        <div className="mt-3 flex">
          <input
            type="text"
            placeholder="Type a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
          />
          <button
            onClick={sendComment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStreaming;
