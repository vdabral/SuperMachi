import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 mt-12 py-8">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ✅ Quick Links */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Links
          </h2>
          <ul className="space-y-3">
            <li>
              <Link to="/" className="hover:text-blue-500">
                🏠 Home
              </Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-blue-500">
                💬 Community
              </Link>
            </li>
            <li>
              <Link to="/collaboration" className="hover:text-blue-500">
                🤝 Collaborations
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-blue-500">
                📅 Events
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-blue-500">
                📖 About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-blue-500">
                📩 Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ✅ Social Media Links */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Follow Us
          </h2>
          <div className="flex justify-center space-x-4">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              <FaGithub size={24} />
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href="https://youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600"
            >
              <FaYoutube size={24} />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>

        {/* ✅ Newsletter Signup */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Stay updated with the latest events & collaborations.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Copyright Notice */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Super Machi. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
