import {
  FaUsers,
  FaHandshake,
  FaRocket,
  FaCode,
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const teamMembers = [
    {
      name: "John Doe",
      role: "Lead Developer",
      avatarId: "123", // Using different IDs for unique avatars
      bio: "Full-stack developer with a passion for building scalable applications.",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Jane Smith",
      role: "UX Designer",
      avatarId: "456",
      bio: "Creative designer focused on crafting intuitive user experiences.",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Mike Johnson",
      role: "Product Manager",
      avatarId: "789",
      bio: "Strategic thinker with a track record of successful product launches.",
      social: {
        github: "#",
        linkedin: "#",
        twitter: "#",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Enhanced Hero Section */}
        <motion.section
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            About Super Machi
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-6 max-w-3xl mx-auto leading-relaxed">
            Building a community where ideas flourish and collaborations thrive,
            one innovation at a time.
          </p>
        </motion.section>

        {/* Enhanced Mission & Vision */}
        <motion.section
          className="grid md:grid-cols-2 gap-10 my-20"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <FaRocket className="text-blue-500 mr-3 text-4xl" />
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              We aim to empower people by providing a cutting-edge platform for
              collaboration, learning, and innovation. Our goal is to break down
              barriers and foster a culture of continuous growth.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <FaHandshake className="text-green-500 mr-3 text-4xl" />
              Our Vision
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              To create a globally connected community where knowledge sharing
              and teamwork lead to groundbreaking innovations. We envision a
              future where collaboration knows no boundaries.
            </p>
          </div>
        </motion.section>

        {/* Enhanced Team Section */}
        <section className="my-20">
          <motion.h2
            className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            Meet Our Team
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.2 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                  <img
                    src={`https://i.pravatar.cc/400?img=${2}`}
                    alt={member.name}
                    className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 relative z-20 -mt-20">
                  <div className="mb-4">
                    <img
                      src={`https://i.pravatar.cc/100?img=${2}`}
                      alt={member.name}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto transform -translate-y-1/2 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
                    {member.name}
                  </h3>
                  <p className="text-blue-500 font-medium mb-4 text-center">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                    {member.bio}
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <a
                      href={member.social.github}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="GitHub Profile"
                    >
                      <FaGithub className="text-xl" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="LinkedIn Profile"
                    >
                      <FaLinkedin className="text-xl" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      aria-label="Twitter Profile"
                    >
                      <FaTwitter className="text-xl" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <motion.section
          className="text-center mt-20 mb-10 py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Journey
          </h2>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto mb-8 px-6">
            Be part of our growing community and contribute to something
            extraordinary. Together, we can build the future of technology.
          </p>
          <Link
            to="/login"
            className={
              "bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
            }
            aria-label="Get Started"
          >
            Get Started Now
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutUs;
