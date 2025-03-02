import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { firestore } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import {
  FaFire,
  FaTrophy,
  FaPlay,
  FaChartLine,
  FaHeart,
  FaCommentAlt,
  FaShare,
  FaBookmark,
  FaFilter,
  FaArrowRight,
  FaVideo,
  FaClock,
  FaEye,
  FaHashtag,
} from "react-icons/fa";

import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";

const VIDEO_DATA_URL =
  "https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json";

const Home = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterBy, setFilterBy] = useState("trending");
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef({});
  const [hoveredVideo, setHoveredVideo] = useState(null);

  // Categories with icons
  const categories = [
    { id: "All", label: "All", icon: <FaFilter /> },
    { id: "Gaming", label: "Gaming", icon: <FaPlay /> },
    { id: "Music", label: "Music", icon: <FaChartLine /> },
    { id: "Education", label: "Education", icon: <FaTrophy /> },
    { id: "Sports", label: "Sports", icon: <FaFire /> },
  ];

  // Filters with icons
  const filters = [
    { id: "trending", label: "Trending", icon: <FaFire /> },
    { id: "newest", label: "Newest", icon: <FaClock /> },
    { id: "popular", label: "Popular", icon: <FaEye /> },
  ];

  useEffect(() => {
    // Fetch Recent Posts from Firestore
    const postsQuery = query(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch Videos from External JSON
    fetch(VIDEO_DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        const enhancedData = data.map((video) => ({
          ...video,
          category: ["Gaming", "Music", "Education", "Sports", "Entertainment"][
            Math.floor(Math.random() * 5)
          ],
          duration: `${Math.floor(Math.random() * 10) + 1}:${Math.floor(
            Math.random() * 60
          )
            .toString()
            .padStart(2, "0")}`,
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 100) + 5,
          publishedAt: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 86400000
          ).toISOString(),
        }));
        setVideos(enhancedData);
      })
      .catch((error) => console.error("Error fetching videos:", error));

    return () => unsubscribePosts();
  }, []);

  // Filter videos by category
  const filteredVideos = videos.filter(
    (video) => activeCategory === "All" || video.category === activeCategory
  );

  // Format published date to "x days ago"
  const formatPublishedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Toggle video playback
  const toggleVideoPlay = (videoId) => {
    if (playingVideoId === videoId) {
      setPlayingVideoId(null);
    } else {
      setPlayingVideoId(videoId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden shadow-lg text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <svg width="300" height="300" viewBox="0 0 200 200">
            <path
              fill="white"
              d="M40,120 C40,80 80,40 120,40 C160,40 200,80 200,120 C200,160 160,200 120,200 C80,200 40,160 40,120 Z"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
            Welcome to Super Machi
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-2xl">
            Join discussions, collaborate on exciting projects, and explore
            trending videos in our vibrant community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              to="/community"
              className="flex items-center justify-center bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore Community <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/collaboration"
              className="flex items-center justify-center bg-blue-800 bg-opacity-30 hover:bg-opacity-40 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm border border-white border-opacity-20"
            >
              Find Collaborations <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md mb-8 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <FaVideo className="mr-2 text-blue-600" /> Discover Content
          </h2>

          <div className="flex items-center space-x-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterBy(filter.id)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-all ${
                  filterBy === filter.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="mr-1.5">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Discussions */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <FaCommentAlt className="mr-2 text-purple-600" /> Recent Discussions
          </h2>
          <Link
            to="/community"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center font-medium"
          >
            View All <FaArrowRight className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 animate-pulse h-40"
              ></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <FaCommentAlt className="text-4xl mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No recent posts. Start a discussion!
            </p>
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition inline-block"
            >
              Create Post
            </Link>
          </div>
        )}
      </section>

      {/* Trending Videos Grid */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <FaFire className="mr-2 text-red-500" /> Trending Videos
          </h2>
          <Link
            to="/videos"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center font-medium"
          >
            View All <FaArrowRight className="ml-1" />
          </Link>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.slice(0, 6).map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div
                  className="relative cursor-pointer aspect-video overflow-hidden"
                  onClick={() => toggleVideoPlay(video.id)}
                >
                  {playingVideoId === video.id ? (
                    <video
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                      ref={(el) => {
                        if (el) videoRefs.current[video.id] = el;
                      }}
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white bg-opacity-90 rounded-full p-3 text-blue-600 hover:text-blue-800 transform hover:scale-110 transition-transform">
                          <FaPlay />
                        </button>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/75 text-white px-2 py-1 text-xs font-medium rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 text-xs font-medium rounded-full flex items-center">
                    <FaHashtag className="mr-1" size={10} />
                    {video.category}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {video.title}
                  </h3>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {video.views.toLocaleString()} views
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatPublishedDate(video.publishedAt)}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {video.description}
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex space-x-4">
                      <button className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <FaHeart className="mr-1" />
                        <span className="text-xs">{video.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        <FaCommentAlt className="mr-1" />
                        <span className="text-xs">{video.comments}</span>
                      </button>
                    </div>
                    <button className="text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors">
                      <FaBookmark />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <FaVideo className="text-4xl mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No trending videos available.
            </p>
          </div>
        )}

        {filteredVideos.length > 6 && (
          <div className="text-center mt-8">
            <Link
              to="/videos"
              className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Load More Videos <FaArrowRight className="ml-2" />
            </Link>
          </div>
        )}
      </section>

      {/* Quick Access Section */}
      <section className="mt-12 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-md">
            <h3 className="text-xl font-bold mb-2">Join a Project</h3>
            <p className="mb-4 text-green-100">
              Find collaborative projects that match your skills and interests.
            </p>
            <Link
              to="/projects"
              className="inline-flex items-center bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Browse Projects <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-md">
            <h3 className="text-xl font-bold mb-2">Upcoming Events</h3>
            <p className="mb-4 text-purple-100">
              Discover workshops, meetups, and virtual events in our community.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              See Calendar <FaArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-md">
            <h3 className="text-xl font-bold mb-2">Learning Resources</h3>
            <p className="mb-4 text-amber-100">
              Access tutorials, guides, and educational materials shared by
              members.
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center bg-white text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Explore Resources <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
