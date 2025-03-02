import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaBookOpen, FaEdit, FaCheck } from "react-icons/fa";

const CommunityGuidelines = () => {
  const { user } = useAuth();
  const [guidelines, setGuidelines] = useState([]);
  const [editing, setEditing] = useState(false);
  const [updatedGuidelines, setUpdatedGuidelines] = useState([]);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchGuidelines();
  }, []);

  // ✅ Fetch Guidelines from Firestore
  const fetchGuidelines = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "guidelines"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGuidelines(data);
      setUpdatedGuidelines(data);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    }
  };

  // ✅ Update Guidelines (Admin Only)
  const saveUpdatedGuidelines = async () => {
    if (!isAdmin) return;
    try {
      updatedGuidelines.forEach(async (item) => {
        const guidelineRef = doc(db, "guidelines", item.id);
        await updateDoc(guidelineRef, { content: item.content });
      });
      setEditing(false);
      setGuidelines(updatedGuidelines);
    } catch (error) {
      console.error("Error updating guidelines:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBookOpen className="mr-2 text-blue-500" /> Community Guidelines
      </h2>

      {/* ✅ Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={() => setEditing(!editing)}
          className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
        >
          {editing ? <FaCheck className="mr-2" /> : <FaEdit className="mr-2" />}
          {editing ? "Save Changes" : "Edit Guidelines"}
        </button>
      )}

      {/* ✅ Guidelines List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {guidelines.length > 0 ? (
          guidelines.map((rule, index) => (
            <div key={rule.id} className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {rule.title}
              </h3>
              {editing ? (
                <textarea
                  value={updatedGuidelines[index].content}
                  onChange={(e) =>
                    setUpdatedGuidelines(
                      updatedGuidelines.map((item, i) =>
                        i === index
                          ? { ...item, content: e.target.value }
                          : item
                      )
                    )
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {rule.content}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No guidelines available.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunityGuidelines;
