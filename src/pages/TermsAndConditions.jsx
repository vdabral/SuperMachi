import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const TermsAndConditions = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const terms = [
    {
      title: "1. Introduction",
      content:
        "By using our platform, you agree to comply with these terms and conditions. We reserve the right to update these terms at any time.",
    },
    {
      title: "2. User Conduct",
      content:
        "Users must not post harmful, illegal, or offensive content. We reserve the right to remove content that violates community guidelines.",
    },
    {
      title: "3. Privacy Policy",
      content:
        "We collect minimal user data necessary for providing services. Your information is not shared with third parties without your consent.",
    },
    {
      title: "4. Intellectual Property",
      content:
        "Users retain ownership of their content, but by posting on our platform, they grant us a license to display and distribute it.",
    },
    {
      title: "5. Limitation of Liability",
      content:
        "We are not responsible for user-generated content or any damages resulting from the use of our platform.",
    },
    {
      title: "6. Termination of Accounts",
      content:
        "We reserve the right to suspend or terminate accounts that violate these terms without prior notice.",
    },
  ];

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* ✅ Hero Section */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
        Terms and Conditions
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center mt-2">
        Please read our terms carefully before using our platform.
      </p>

      {/* ✅ Terms List */}
      <div className="mt-10 space-y-4">
        {terms.map((term, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
          >
            <button
              className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-900 dark:text-white focus:outline-none"
              onClick={() => toggleSection(index)}
            >
              {term.title}
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openIndex === index && (
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                {term.content}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ✅ Acceptance Statement */}
      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-300">
          By using our platform, you acknowledge that you have read and agreed
          to these terms.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
