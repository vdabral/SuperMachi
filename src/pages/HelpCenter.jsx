import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaQuestionCircle, FaSearch, FaEdit, FaCheck } from "react-icons/fa";

const HelpCenter = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [updatedFaqs, setUpdatedFaqs] = useState([]);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchFaqs();
  }, []);

  // ✅ Fetch FAQs from Firestore
  const fetchFaqs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "faqs"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFaqs(data);
      setUpdatedFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  // ✅ Update FAQs (Admin Only)
  const saveUpdatedFaqs = async () => {
    if (!isAdmin) return;
    try {
      updatedFaqs.forEach(async (item) => {
        const faqRef = doc(db, "faqs", item.id);
        await updateDoc(faqRef, { answer: item.answer });
      });
      setEditing(false);
      setFaqs(updatedFaqs);
    } catch (error) {
      console.error("Error updating FAQs:", error);
    }
  };

  // ✅ Filter FAQs Based on Search
  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaQuestionCircle className="mr-2 text-blue-500" /> Help Center
      </h2>

      {/* ✅ Search Bar */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
        />
        <FaSearch className="absolute right-4 top-3 text-gray-500" />
      </div>

      {/* ✅ Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={() => setEditing(!editing)}
          className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
        >
          {editing ? <FaCheck className="mr-2" /> : <FaEdit className="mr-2" />}
          {editing ? "Save Changes" : "Edit FAQs"}
        </button>
      )}

      {/* ✅ FAQ List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div key={faq.id} className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {faq.question}
              </h3>
              {editing ? (
                <textarea
                  value={updatedFaqs[index].answer}
                  onChange={(e) =>
                    setUpdatedFaqs(
                      updatedFaqs.map((item, i) =>
                        i === index ? { ...item, answer: e.target.value } : item
                      )
                    )
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-700"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No FAQs available.</p>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
