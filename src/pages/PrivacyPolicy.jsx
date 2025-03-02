import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PrivacyPolicy = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const policies = [
    {
      title: "1. Introduction",
      content:
        "We respect your privacy and are committed to protecting your personal data. This policy explains how we handle your information.",
    },
    {
      title: "2. Information We Collect",
      content:
        "We collect personal data such as name, email, and usage analytics to improve our services. This data is stored securely.",
    },
    {
      title: "3. How We Use Your Information",
      content:
        "Your data is used to enhance user experience, provide customer support, and improve our platform's functionality.",
    },
    {
      title: "4. Data Security",
      content:
        "We implement advanced security measures to protect user data from unauthorized access or breaches.",
    },
    {
      title: "5. Sharing of Information",
      content:
        "We do not sell or share your personal information with third parties, except when required by law.",
    },
    {
      title: "6. Your Rights",
      content:
        "You have the right to access, modify, or delete your personal data. Contact support for assistance.",
    },
    {
      title: "7. Changes to Privacy Policy",
      content:
        "We may update this policy from time to time. Continued use of our platform means you accept any updates.",
    },
  ];

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* ✅ Hero Section */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
        Privacy Policy
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center mt-2">
        Learn how we collect, use, and protect your data.
      </p>

      {/* ✅ Privacy Policy List */}
      <div className="mt-10 space-y-4">
        {policies.map((policy, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
          >
            <button
              className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
              onClick={() => toggleSection(index)}
            >
              {policy.title}
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                {policy.content}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Acceptance Statement */}
      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-300">
          By using our platform, you acknowledge that you have read and
          understood our privacy policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
