import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click on the 'Sign Up' button on the top right, enter your details, and confirm your email to get started.",
    },
    {
      question: "Is this platform free to use?",
      answer:
        "Yes! Our platform is free to use. However, certain premium features may be introduced in the future.",
    },
    {
      question: "How can I collaborate on a project?",
      answer:
        "Go to the 'Collaboration' section, browse existing projects, or create your own to invite others.",
    },
    {
      question: "Can I delete my posts?",
      answer:
        "Yes, you can delete your own posts from the 'Profile' section under 'My Posts'.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Each post has a 'Report' button that you can use to flag inappropriate content for review.",
    },
    {
      question: "How can I contact support?",
      answer:
        "Visit our 'Contact Us' page and fill out the form or email us at support@supermachi.com.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* ✅ Hero Section */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
        Frequently Asked Questions
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center mt-2">
        Find answers to common questions about our platform.
      </p>

      {/* ✅ FAQ List */}
      <div className="mt-10 space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
          >
            <button
              className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
