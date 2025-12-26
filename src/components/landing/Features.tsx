/**
@file src/components/landing/Features.tsx
@description Features section for the Reflectify landing page.
*/

"use client";

import { motion } from "framer-motion";

// Animation variants for framer-motion
const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.6 },
  },
};

// Features section component
export function Features() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 md:mt-20 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
      {...animations.fadeInUp}
    >
      {[
        {
          title: "Anonymous Feedback",
          description: "Share honest thoughts without revealing your identity",
          icon: "🔒",
        },
        {
          title: "Custom Forms",
          description: "Create tailored feedback forms for your needs",
          icon: "📋",
        },
        {
          title: "Actionable Insights",
          description: "Transform feedback into meaningful improvements",
          icon: "💡",
        },
      ].map((feature, index) => (
        <div
          key={index}
          className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-transform duration-300"
        >
          <div className="text-4xl mb-4 text-light-highlight dark:text-dark-highlight">
            {feature.icon}
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-secondary-darker dark:text-secondary-lighter mb-2">
            {feature.title}
          </h3>
          <p className="text-light-text dark:text-dark-text">
            {feature.description}
          </p>
        </div>
      ))}
    </motion.div>
  );
}
