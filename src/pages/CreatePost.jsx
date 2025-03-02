import { useState } from "react";
import { firestore } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(firestore, "posts"), {
        ...formData,
        createdAt: serverTimestamp(),
        likes: [], // Initialize likes as an empty array
      });
      setSuccessMessage("Post created successfully!");
      setFormData({ title: "", content: "" });
    } catch (error) {
      console.error("Error creating post:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
        Create a New Post
      </h1>
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input
          type="text"
          name="title"
          placeholder="Post Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <textarea
          name="content"
          placeholder="Post Content"
          rows="5"
          value={formData.content}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className={`w-full px-6 py-2 text-white rounded-lg transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
