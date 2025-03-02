import { useEffect, useState, useRef, useCallback } from "react";
import { firestore } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import PostCard from "./PostCard";

const PostList = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPost, setLastPost] = useState(null);
  const [filter, setFilter] = useState("newest");
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);

  // Fetch initial posts
  useEffect(() => {
    setLoading(true);
    const fetchPosts = () => {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy(
          filter === "popular" ? "likeCount" : "createdAt",
          filter === "oldest" ? "asc" : "desc"
        ),
        limit(5)
      );

      const unsubscribe = onSnapshot(postQuery, (snapshot) => {
        if (!snapshot.empty) {
          setLastPost(snapshot.docs[snapshot.docs.length - 1]); // Store last post for pagination
          setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } else {
          setPosts([]);
          setLastPost(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, [filter]);

  // Load more posts when reaching the bottom
  const loadMorePosts = useCallback(() => {
    if (!lastPost || loadingMore) return;
    setLoadingMore(true);

    const morePostsQuery = query(
      collection(firestore, "posts"),
      orderBy(
        filter === "popular" ? "likeCount" : "createdAt",
        filter === "oldest" ? "asc" : "desc"
      ),
      startAfter(lastPost),
      limit(5)
    );

    const unsubscribe = onSnapshot(morePostsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setLastPost(snapshot.docs[snapshot.docs.length - 1]);
        setPosts((prev) => [
          ...prev,
          ...snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ]);
      } else {
        setLastPost(null); // No more posts available
      }
      setLoadingMore(false);
    });

    return () => unsubscribe();
  }, [lastPost, filter, loadingMore]);

  // Intersection Observer for Infinite Scrolling
  useEffect(() => {
    if (!observerRef.current) return;
    const observerInstance = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMorePosts();
      },
      { threshold: 1.0 }
    );

    observerInstance.observe(observerRef.current);
    return () => observerInstance.disconnect();
  }, [lastPost, loadMorePosts]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Filter Controls */}
      <div className="bg-white dark:bg-gray-900 p-4 mb-4 rounded-lg shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Community Posts
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-md text-sm p-1 focus:ring-2 focus:ring-blue-300 dark:bg-gray-800"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            No posts available yet
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to share something with the community!
          </p>
        </div>
      )}

      {/* Posts List */}
      {!loading && posts.map((post) => <PostCard key={post.id} post={post} />)}

      {/* Infinite Scroll Trigger */}
      <div ref={observerRef} className="h-10"></div>

      {/* Loading More Posts */}
      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default PostList;
