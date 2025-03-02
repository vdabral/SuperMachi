import { useState } from "react";
import { firestore } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  FaThumbsUp,
  FaComment,
  FaTrash,
  FaShare,
  FaBookmark,
} from "react-icons/fa";

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    if (!user) return alert("You must be logged in to like a post.");

    const postRef = doc(firestore, "posts", post.id);

    try {
      if (post.likes?.includes(user.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likeCount: increment(-1),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likeCount: increment(1),
        });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const postRef = doc(firestore, "posts", post.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          text: commentText,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          timestamp: new Date().toISOString(),
        }),
      });
      setCommentText("");
      setIsCommenting(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(firestore, "posts", post.id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={post.authorPhotoURL || "/default-avatar.png"}
            alt={post.authorName}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {post.authorName}
            </h3>
            <p className="text-sm text-gray-500">
              {post.createdAt?.seconds
                ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                : "Date Unavailable"}
            </p>
          </div>
        </div>

        {/* Delete Button (Visible only for post owner) */}
        {user?.uid === post.authorId && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {post.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="mt-3 rounded-lg w-full object-cover max-h-96"
          />
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{post.likeCount || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-b border-gray-200 py-2">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition`}
        >
          <FaThumbsUp />
          <span>Like</span>
        </button>

        <button
          onClick={() => setIsCommenting(!isCommenting)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <FaComment />
          <span>Comment</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
          <FaShare />
          <span>Share</span>
        </button>

        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
          <FaBookmark />
          <span>Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {isCommenting && (
        <div className="mt-4">
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-4">
            {post.comments?.map((comment, index) => (
              <div key={index} className="flex items-start space-x-3">
                <img
                  src="/default-avatar.png"
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                      {comment.authorName}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp
                        ? new Date(comment.timestamp).toLocaleDateString()
                        : "Time Unknown"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
