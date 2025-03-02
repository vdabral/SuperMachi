import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaPaperPlane, FaUserCircle } from "react-icons/fa";

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  // ✅ Fetch Real-time Messages
  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
      onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  // ✅ Send a Message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Messages
      </h2>

      {/* ✅ Messages List */}
      <div className="h-80 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading messages...
          </p>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start mb-4 ${
                msg.senderId === user.uid ? "justify-end" : "justify-start"
              }`}
            >
              {/* ✅ Sender Avatar */}
              <FaUserCircle className="text-gray-500 dark:text-gray-300 text-3xl mr-2" />

              <div className="max-w-xs p-3 rounded-lg shadow-md bg-blue-100 dark:bg-blue-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {msg.senderName}
                </p>
                <p className="text-gray-700 dark:text-gray-300">{msg.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>

      {/* ✅ Message Input */}
      <div className="mt-4 flex">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg transition"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Messages;
