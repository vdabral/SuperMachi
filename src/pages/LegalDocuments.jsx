import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaFileContract, FaTrash, FaEdit, FaDownload } from "react-icons/fa";

const LegalDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [newDoc, setNewDoc] = useState({ title: "", content: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === "admin@example.com"; // Replace with actual admin verification logic

  useEffect(() => {
    fetchLegalDocuments();
  }, []);

  // ✅ Fetch Legal Documents from Firestore
  const fetchLegalDocuments = async () => {
    try {
      const q = query(
        collection(db, "legalDocuments"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setDocuments(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching legal documents:", error);
      setLoading(false);
    }
  };

  // ✅ Submit a New Legal Document (Admin Only)
  const submitLegalDocument = async () => {
    if (!newDoc.title.trim() || !newDoc.content.trim()) return;
    try {
      const docRef = await addDoc(collection(db, "legalDocuments"), {
        ...newDoc,
        createdAt: serverTimestamp(),
      });
      setDocuments([{ id: docRef.id, ...newDoc }, ...documents]);
      setNewDoc({ title: "", content: "" });
    } catch (error) {
      console.error("Error adding legal document:", error);
    }
  };

  // ✅ Update Legal Document (Admin Only)
  const updateLegalDocument = async () => {
    if (!editing) return;
    try {
      await updateDoc(doc(db, "legalDocuments", editing.id), editing);
      setDocuments(documents.map((d) => (d.id === editing.id ? editing : d)));
      setEditing(null);
    } catch (error) {
      console.error("Error updating legal document:", error);
    }
  };

  // ✅ Delete Legal Document (Admin Only)
  const deleteLegalDocument = async (docId) => {
    if (!isAdmin) return;
    if (
      window.confirm("Are you sure you want to delete this legal document?")
    ) {
      try {
        await deleteDoc(doc(db, "legalDocuments", docId));
        setDocuments(documents.filter((d) => d.id !== docId));
      } catch (error) {
        console.error("Error deleting legal document:", error);
      }
    }
  };

  // ✅ Download Document as TXT
  const downloadDocument = (doc) => {
    const element = document.createElement("a");
    const file = new Blob([doc.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaFileContract className="mr-2 text-blue-500" /> Legal Documents
      </h2>

      {/* ✅ Admin: Submit a New Legal Document */}
      {isAdmin && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {editing ? "Edit Legal Document" : "Add New Document"}
          </h3>
          <input
            type="text"
            placeholder="Document Title (e.g., Terms of Service)"
            value={editing ? editing.title : newDoc.title}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, title: e.target.value })
                : setNewDoc({ ...newDoc, title: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <textarea
            placeholder="Document Content"
            value={editing ? editing.content : newDoc.content}
            onChange={(e) =>
              editing
                ? setEditing({ ...editing, content: e.target.value })
                : setNewDoc({ ...newDoc, content: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg mt-2 dark:bg-gray-700"
            rows="6"
          />
          <button
            onClick={editing ? updateLegalDocument : submitLegalDocument}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            {editing ? "Update Document" : "Submit Document"}
          </button>
        </div>
      )}

      {/* ✅ Legal Documents List */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Loading legal documents...
          </p>
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border-b border-gray-300 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {doc.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {doc.content}
              </p>
              <div className="mt-2 flex space-x-3">
                <button
                  onClick={() => downloadDocument(doc)}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaDownload /> Download
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setEditing(doc)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => deleteLegalDocument(doc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No legal documents available.
          </p>
        )}
      </div>
    </div>
  );
};

export default LegalDocuments;
