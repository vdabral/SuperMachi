import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-6">
      {/* 404 Error Image or Icon */}
      <img
        src="/404-error.svg"
        alt="Page Not Found"
        className="w-72 h-auto mb-6"
      />

      {/* Error Message */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
        Oops! The page you're looking for doesn't exist.
      </p>

      {/* Navigation Button */}
      <Link
        to="/"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
