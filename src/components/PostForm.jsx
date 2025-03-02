import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaUpload, FaTimes, FaTag } from "react-icons/fa";

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = null;
      if (image) {
        const imageRef = ref(storage, `posts/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Save post to Firestore
      const docRef = await addDoc(collection(firestore, "posts"), {
        title,
        content,
        category,
        tags,
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        likes: 0,
        comments: [],
      });

      // Reset form
      setTitle("");
      setContent("");
      setCategory("general");
      setTags([]);
      setImage(null);
      setImagePreview(null);

      // Notify parent component about new post
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError("Failed to create post. Try again.");
      console.error("Post creation error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
        Create a New Post
      </h2>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Enter a compelling title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
          required
        />

        {/* Content Input */}
        <textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
          rows="5"
          required
        />

        {/* Category Selection */}
        <div>
          <label className="text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
          >
            <option value="general">General</option>
            <option value="tech">Tech</option>
            <option value="health">Health</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>

        {/* Tags Input */}
        <div>
          <label className="text-gray-700 dark:text-gray-300 flex items-center">
            <FaTag className="mr-2" /> Tags (Press Enter to add)
          </label>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
            />
          </div>
          <div className="flex flex-wrap mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white px-3 py-1 rounded-full text-sm m-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-gray-700 dark:text-gray-300 flex items-center">
            <FaUpload className="mr-2" /> Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mt-2"
          />
          {imagePreview && (
            <div className="relative mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full px-6 py-2 text-white rounded-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Posting..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
